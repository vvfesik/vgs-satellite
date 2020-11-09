from unittest.mock import call, Mock

from freezegun import freeze_time

from satellite.ctx import ProxyContext
from satellite.proxy import audit_logs, ProxyMode
from satellite.vault.vault_handler import VaultFlows

from ..factories import load_flow, RouteFactory, RuleEntryFactory


@freeze_time()
def test_request_redact(monkeypatch, snapshot):
    route = RouteFactory()
    rule_entry = RuleEntryFactory()

    monkeypatch.setattr(
        'satellite.vault.vault_handler.ctx.get_proxy_context',
        Mock(return_value=ProxyContext(
            mode=ProxyMode.FORWARD,
            port=9099,
        )),
    )
    monkeypatch.setattr(
        'satellite.vault.vault_handler.match_route',
        Mock(return_value=(route, [rule_entry])),
    )
    monkeypatch.setattr(
        'satellite.vault.vault_handler.transform_body',
        Mock(return_value=('transformed body', [True])),
    )
    emit_audit_log_record = Mock()
    monkeypatch.setattr(
        'satellite.vault.vault_handler.audit_logs.emit',
        emit_audit_log_record,
    )

    flow = load_flow('http_raw')
    assert not hasattr(flow, 'request_raw')

    VaultFlows().request(flow)

    emit_audit_log_record.assert_called_once_with(
        audit_logs.VaultRequestAuditLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            method=flow.request.method,
            uri=flow.request.url,
        ),
    )
    assert hasattr(flow, 'request_raw')
    assert flow.request.content != flow.request_raw.content
    assert flow.request.match_details == {
        'route_id': route.id,
        'filters': [{'id': rule_entry.id, 'operation_applied': True}]
    }
    snapshot.assert_match(flow.request.get_state(), 'request')
    snapshot.assert_match(flow.request_raw.get_state(), 'request_raw')


def test_request_without_redact(monkeypatch):
    monkeypatch.setattr(
        'satellite.vault.vault_handler.ctx.get_proxy_context',
        Mock(return_value=ProxyContext(
            mode=ProxyMode.FORWARD,
            port=9099,
        )),
    )
    monkeypatch.setattr(
        'satellite.vault.vault_handler.match_route',
        Mock(return_value=(None, None)),
    )

    flow = load_flow('http_raw')
    assert not hasattr(flow, 'request_raw')

    VaultFlows().request(flow)

    assert hasattr(flow, 'request_raw')
    assert flow.request.content == flow.request_raw.content
    assert not hasattr(flow.request, 'match_details')


@freeze_time()
def test_response_redact(monkeypatch, snapshot):
    route = RouteFactory()
    rule_entry = RuleEntryFactory()

    monkeypatch.setattr(
        'satellite.vault.vault_handler.ctx.get_proxy_context',
        Mock(return_value=ProxyContext(
            mode=ProxyMode.FORWARD,
            port=9099,
        )),
    )
    monkeypatch.setattr(
        'satellite.vault.vault_handler.match_route',
        Mock(return_value=(route, [rule_entry])),
    )
    monkeypatch.setattr(
        'satellite.vault.vault_handler.transform_body',
        Mock(return_value=('transformed body', [True])),
    )
    emit_audit_log_record = Mock()
    monkeypatch.setattr(
        'satellite.vault.vault_handler.audit_logs.emit',
        emit_audit_log_record,
    )

    flow = load_flow('http_raw')
    flow.server_conn.wfile = Mock(get_log=Mock(return_value=b'abc'))
    flow.server_conn.rfile = Mock(get_log=Mock(return_value=b'qwerty'))
    assert not hasattr(flow, 'response_raw')

    VaultFlows().response(flow)

    emit_audit_log_record.assert_has_calls([
        call(audit_logs.VaultTrafficLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            bytes=3,
            label=audit_logs.TrafficLabel.TO_SERVER,
        )),
        call(audit_logs.VaultTrafficLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            bytes=6,
            label=audit_logs.TrafficLabel.FROM_SERVER,
        )),
        call(audit_logs.UpstreamResponseLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            upstream='httpbin.org',
            status_code=200,
        )),
    ])
    assert hasattr(flow, 'response_raw')
    assert flow.response.content != flow.response_raw.content
    assert flow.response.match_details == {
        'route_id': route.id,
        'filters': [{'id': rule_entry.id, 'operation_applied': True}]
    }
    snapshot.assert_match(flow.response.get_state(), 'response')
    snapshot.assert_match(flow.response_raw.get_state(), 'response_raw')


def test_response_without_redact(monkeypatch):
    monkeypatch.setattr(
        'satellite.vault.vault_handler.ctx.get_proxy_context',
        Mock(return_value=ProxyContext(
            mode=ProxyMode.FORWARD,
            port=9099,
        )),
    )
    monkeypatch.setattr(
        'satellite.vault.vault_handler.match_route',
        Mock(return_value=(None, None)),
    )

    flow = load_flow('http_raw')
    assert not hasattr(flow, 'response_raw')

    flow.server_conn.wfile = Mock(get_log=Mock(return_value=b'abc'))
    flow.server_conn.rfile = Mock(get_log=Mock(return_value=b'qwerty'))

    VaultFlows().response(flow)

    assert hasattr(flow, 'response_raw')
    assert flow.response.content == flow.response_raw.content
    assert not hasattr(flow.response, 'match_details')
