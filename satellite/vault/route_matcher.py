from satellite.master import ProxyMode
from satellite.service import route_manager
from satellite.model.route import RouteType, Phase


def match_route(proxy_mode: ProxyMode, phase: Phase, flow):
    routes_filters = []
    request = flow.request
    if proxy_mode == ProxyMode.INCOMPATIBLE:
        return
    route_type = RouteType.INBOUND if proxy_mode == ProxyMode.REVERSE else RouteType.OUTBOUND
    routes = route_manager.get_all_by_type(route_type)
    request_host = request.host.replace('/', '').replace('.', '\\.')
    if proxy_mode == ProxyMode.FORWARD:
        routes = [route for route in routes if route.host_endpoint == request_host]
    for route in routes:
        # route.rule_entries_list = match_filters(route.rule_entries_list, phase, request)
        rule_entries_list = match_filters(route.rule_entries_list, phase, request)
        if len(rule_entries_list) > 0:
            routes_filters += [rule_entries_list]
    return routes_filters


def match_filters(rule_entries, phase: Phase, request):
    rule_entries = [rule_entry for rule_entry in rule_entries if rule_entry.phase == phase.value]
    return [rule_entry for rule_entry in rule_entries if match_filter(rule_entry.expression_snapshot, request)]


def match_filter(expression_snapshot, request):
    evaluated = []
    rules = expression_snapshot['rules']
    condition = expression_snapshot['condition']
    for rule in rules:
        expression = rule['expression']
        evaluated += [(expression['values'][0].lower() == extract_value(request, expression['field']).lower())]
    return all(evaluated) if condition == 'AND' else any(evaluated)


def extract_value(request, field):
    if field == 'PathInfo':
        return request.path
    if field == 'ContentType':
        return request.headers['Content-type'] if 'Content-type' in request.headers else ''
    if field == 'Method':
        return request.method
    return ''
