from mitmproxy import ctx

from satellite import ctx as satellite_ctx
from satellite.vault.route_matcher import match_route
from satellite.vault.transformation_manager import transform_body
from satellite.model.route import Phase
from satellite.service.alias_manager import RedactFailed, RevealFailed


class VaultFlows:

    # DO NOT EXTRACT COMMON CODE - BREAKS HTTP2 ON MITMPROXY (TODO: investigate)
    def request(self, flow):
        try:
            flow.request_raw = flow.request.copy()
            content = flow.request.content
            proxy_mode = satellite_ctx.webapp.master.proxy_mode
            route, route_filters = match_route(proxy_mode, Phase.REQUEST, flow)
            if route_filters:
                flow.request.text = transform_body(route_filters, content)
                flow.request.match_details = {
                    'route_id': route.id,
                    'filter_ids': [rule.id for rule in route_filters]
                }

        except (RedactFailed, RevealFailed) as error_message:
            ctx.log.error(str(error_message))

    def response(self, flow):
        try:
            flow.response_raw = flow.response.copy()
            content = flow.response.content
            proxy_mode = satellite_ctx.webapp.master.proxy_mode
            route, route_filters = match_route(proxy_mode, Phase.RESPONSE, flow)
            if route_filters:
                flow.response.text = transform_body(route_filters, content)
                flow.response.match_details = {
                    'route_id': route.id,
                    'filter_ids': [rule.id for rule in route_filters]
                }
        except (RedactFailed, RevealFailed) as error_message:
            ctx.log.error(str(error_message))
