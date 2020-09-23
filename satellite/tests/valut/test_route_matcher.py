from unittest.mock import Mock

from ..factories import load_flow, RouteFactory, RuleEntryFactory

from satellite.master import ProxyMode
from satellite.model.route import Phase
from satellite.vault.route_matcher import match_route


def test_match_route_no_match(monkeypatch):
    monkeypatch.setattr(
        'satellite.vault.route_matcher.route_manager',
        Mock(get_all_by_type=Mock(return_value=[]))
    )
    flow = load_flow('http_raw')

    matched_route, matched_filters = match_route(
        proxy_mode=ProxyMode.REVERSE,
        phase=Phase.REQUEST,
        flow=flow,
    )

    assert matched_route is None
    assert matched_filters is None


def test_match_route_inbound(monkeypatch):
    filters = RuleEntryFactory.build_batch(2)
    filters[1].expression_snapshot['rules'][0]['expression']['values'] = ['/put']
    route = RouteFactory(rule_entries_list=filters)
    monkeypatch.setattr(
        'satellite.vault.route_matcher.route_manager',
        Mock(get_all_by_type=Mock(return_value=[route]))
    )
    flow = load_flow('http_raw')

    matched_route, matched_filters = match_route(
        proxy_mode=ProxyMode.REVERSE,
        phase=Phase.REQUEST,
        flow=flow,
    )

    assert matched_route is route
    assert matched_filters == [filters[0]]


def test_match_route_outbound(monkeypatch):
    filters = RuleEntryFactory.build_batch(2)
    filters[1].expression_snapshot['rules'][0]['expression']['values'] = ['/put']
    route1 = RouteFactory(rule_entries_list=filters)
    route2 = RouteFactory(rule_entries_list=[RuleEntryFactory()])
    route2.host_endpoint = 'https://unknown-upstream.io'
    monkeypatch.setattr(
        'satellite.vault.route_matcher.route_manager',
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
