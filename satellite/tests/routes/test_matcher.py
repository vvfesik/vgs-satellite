from unittest.mock import Mock, call

from freezegun import freeze_time

from satellite.audit_logs.records import (
    FilterEvaluationLogRecord,
    RouteEvaluationLogRecord,
)
from satellite.proxy import ProxyMode
from satellite.routes import Phase
from satellite.routes.matcher import match_route

from ..factories import RouteFactory, RuleEntryFactory, load_flow


def test_match_route_no_match(monkeypatch):
    monkeypatch.setattr(
        'satellite.routes.matcher.route_manager',
        Mock(get_all_by_type=Mock(return_value=[]))
    )
    emit_audit_log = Mock()
    monkeypatch.setattr(
        'satellite.routes.matcher.audit_logs.emit',
        emit_audit_log,
    )
    flow = load_flow('http_raw')

    matched_route, matched_filters = match_route(
        proxy_mode=ProxyMode.REVERSE,
        phase=Phase.REQUEST,
        flow=flow,
    )

    assert matched_route is None
    assert matched_filters == []
    emit_audit_log.assert_not_called()


@freeze_time('2020-11-04')
def test_match_route_inbound(monkeypatch):
    route = RouteFactory()
    filters = RuleEntryFactory.build_batch(2, route_id=route.id)
    filters[1].expression_snapshot['rules'][0]['expression']['values'] = ['/put']
    route.rule_entries_list = filters
    monkeypatch.setattr(
        'satellite.routes.matcher.route_manager',
        Mock(get_all_by_type=Mock(return_value=[route]))
    )

    emit_audit_log = Mock()
    monkeypatch.setattr(
        'satellite.routes.matcher.audit_logs.emit',
        emit_audit_log,
    )

    flow = load_flow('http_raw')

    matched_route, matched_filters = match_route(
        proxy_mode=ProxyMode.REVERSE,
        phase=Phase.REQUEST,
        flow=flow,
    )

    assert matched_route is route
    assert matched_filters == [filters[0]]
    emit_audit_log.assert_has_calls([
        call(FilterEvaluationLogRecord(
            flow_id=flow.id,
            matched=True,
            phase=Phase.REQUEST,
            proxy_mode=ProxyMode.REVERSE,
            route_id=route.id,
            filter_id=filters[0].id,
        )),
        call(FilterEvaluationLogRecord(
            flow_id=flow.id,
            matched=False,
            phase=Phase.REQUEST,
            proxy_mode=ProxyMode.REVERSE,
            route_id=route.id,
            filter_id=filters[1].id,
        )),
        call(RouteEvaluationLogRecord(
            flow_id=flow.id,
            matched=True,
            phase=Phase.REQUEST,
            proxy_mode=ProxyMode.REVERSE,
            route_id=route.id,
        )),
    ])


def test_match_route_outbound(monkeypatch):
    filters = RuleEntryFactory.build_batch(2)
    filters[1].expression_snapshot['rules'][0]['expression']['values'] = ['/put']
    route1 = RouteFactory(rule_entries_list=filters)
    route2 = RouteFactory(rule_entries_list=[RuleEntryFactory()])
    route2.host_endpoint = 'https://unknown-upstream.io'
    monkeypatch.setattr(
        'satellite.routes.matcher.route_manager',
        Mock(get_all_by_type=Mock(return_value=[route1, route2]))
    )
    flow = load_flow('http_raw')

    matched_route, matched_filters = match_route(
        proxy_mode=ProxyMode.FORWARD,
        phase=Phase.REQUEST,
        flow=flow,
    )

    assert matched_route is route1
    assert matched_filters == [filters[0]]
