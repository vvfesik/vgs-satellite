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
            content = flow.request.content
            proxy_mode = satellite_ctx.webapp.master.proxy_mode
            routes_filters = match_route(proxy_mode, Phase.REQUEST, flow)
            if len(routes_filters) < 1:
                return
            flow.request_raw = flow.request.copy()
            flow.request.text = transform_body(routes_filters[0], content)
        except (RedactFailed, RevealFailed) as error_message:
            ctx.log.error(str(error_message))

    def response(self, flow):
        try:
            content = flow.response.content
            proxy_mode = satellite_ctx.webapp.master.proxy_mode
            routes_filters = match_route(proxy_mode, Phase.RESPONSE, flow)
            if len(routes_filters) < 1:
                return
            flow.response_raw = flow.response.copy()
            flow.response.text = transform_body(routes_filters[0], content)
        except (RedactFailed, RevealFailed) as error_message:
            ctx.log.error(str(error_message))
