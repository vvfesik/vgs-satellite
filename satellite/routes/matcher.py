from functools import partial
from typing import List, Optional, Tuple

from mitmproxy.http import HTTPFlow

from satellite import audit_logs
from satellite.db.models.route import Route, RuleEntry
from satellite.proxy import ProxyMode

from . import Phase, RouteType, manager as route_manager
from .expressions import CompositeExpression


def match_route(
    proxy_mode: ProxyMode,
    phase: Phase,
    flow: HTTPFlow,
) -> Tuple[Optional[Route], List[RuleEntry]]:
    request = flow.request
    route_type = RouteType.INBOUND if proxy_mode == ProxyMode.REVERSE else RouteType.OUTBOUND
    routes = route_manager.get_all_by_type(route_type)
    request_host = request.host.replace('/', '').replace('.', '\\.')
    if proxy_mode == ProxyMode.FORWARD:
        routes = [route for route in routes if route.host_endpoint == request_host]

    for route in routes:
        match_filters = partial(match_filter, proxy_mode, phase, flow)
        filters = list(filter(match_filters, route.rule_entries_list))
        matched = bool(filters)
        audit_logs.emit(audit_logs.records.RouteEvaluationLogRecord(
            flow_id=flow.id,
            matched=matched,
            phase=phase,
            proxy_mode=proxy_mode,
            route_id=route.id,
        ))
        if matched:
            return route, filters

    return None, []


def match_filter(
    proxy_mode: ProxyMode,
    phase: Phase,
    flow: HTTPFlow,
    fltr: RuleEntry,
) -> bool:
    if fltr.phase != phase:
        # TODO: Should we emit filter audit logs when phases do not match?
        return False

    expr = CompositeExpression.build(fltr.expression_snapshot)
    matched = expr.evaluate(flow)

    audit_logs.emit(audit_logs.records.FilterEvaluationLogRecord(
        flow_id=flow.id,
        matched=matched,
        phase=phase,
        proxy_mode=proxy_mode,
        route_id=fltr.route_id,
        filter_id=fltr.id,
    ))

    return matched
