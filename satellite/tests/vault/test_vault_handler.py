from unittest.mock import call, Mock

from freezegun import freeze_time

from satellite.audit_logs import records
from satellite.ctx import ProxyContext
from satellite.proxy import ProxyMode
from satellite.vault.vault_handler import VaultFlows

from ..factories import load_flow, RouteFactory, RuleEntryFactory


def mock_transform(flow, *args, **kwargs):
    flow.transformed = True
    return True


@freeze_time()
def test_request_redact(monkeypatch):
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
        'satellite.vault.vault_handler.transform',
        mock_transform,
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
        records.VaultRequestAuditLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            method=flow.request.method,
            uri=flow.request.url,
        ),
    )
    assert hasattr(flow, 'request_raw')
    assert flow.transformed
    assert flow.request.match_details == {
        'route_id': route.id,
        'filters': [{'id': rule_entry.id, 'operation_applied': True}]
    }


@freeze_time()
def test_response_redact(monkeypatch):
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
        'satellite.vault.vault_handler.transform',
        mock_transform,
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
        call(records.VaultTrafficLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            bytes=3,
            label=records.TrafficLabel.TO_SERVER,
        )),
        call(records.VaultTrafficLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            bytes=6,
            label=records.TrafficLabel.FROM_SERVER,
        )),
        call(records.UpstreamResponseLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            upstream='httpbin.org',
            status_code=200,
        )),
    ])
    assert hasattr(flow, 'response_raw')
    assert flow.transformed
    assert flow.response.match_details == {
        'route_id': route.id,
        'filters': [{'id': rule_entry.id, 'operation_applied': True}]
    }


@freeze_time()
def test_operations(monkeypatch):
    route = RouteFactory()
    rule_entry = RuleEntryFactory(operations_v2='"some json"')

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
        'satellite.vault.vault_handler.transform',
        mock_transform,
    )
    monkeypatch.setattr('satellite.vault.vault_handler.audit_logs.emit', Mock())
    build_pipeline = Mock(return_value=Mock(evaluate=mock_transform))
    monkeypatch.setattr(
        'satellite.vault.vault_handler.build_pipeline',
        build_pipeline,
    )

    flow = load_flow('http_raw')
    assert not hasattr(flow, 'request_raw')

    VaultFlows().request(flow)

    assert flow.transformed
    assert flow.request.match_details == {
        'route_id': route.id,
        'filters': [{'id': rule_entry.id, 'operation_applied': True}]
    }
