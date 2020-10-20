import logging

from satellite import ctx
from satellite.vault.route_matcher import match_route
from satellite.vault.transformation_manager import transform_body
from satellite.db.models.route import Phase
from satellite.service.alias_manager import RedactFailed, RevealFailed


logger = logging.getLogger()


class VaultFlows:

    # DO NOT EXTRACT COMMON CODE - BREAKS HTTP2 ON MITMPROXY (TODO: investigate)
    def request(self, flow):
        try:
            flow.request_raw = flow.request.copy()
            content = flow.request.content
            route, route_filters = match_route(ctx.proxy_mode, Phase.REQUEST, flow)
            if route_filters:
                # TODO: Encapsulate flow transformation somewere else
                flow.request.text, ops_applications = transform_body(
                    route_filters,
                    content,
                )
                matched_filters = [
                    {'id': rule.id, 'operation_applied': op_applied}
                    for rule, op_applied in zip(route_filters, ops_applications)
                ]
                flow.request.match_details = {
                    'route_id': route.id,
                    'filters': matched_filters,
                }

        except (RedactFailed, RevealFailed) as exc:
            logger.error(exc)

        except Exception as exc:
            logger.exception(exc)

    def response(self, flow):
        try:
            flow.response_raw = flow.response.copy()
            content = flow.response.content
            route, route_filters = match_route(ctx.proxy_mode, Phase.RESPONSE, flow)
            if route_filters:
                # TODO: Encapsulate flow transformation somewere else
                flow.response.text, ops_applications = transform_body(
                    route_filters,
                    content
                )
                matched_filters = [
                    {'id': rule.id, 'operation_applied': op_applied}
                    for rule, op_applied in zip(route_filters, ops_applications)
                ]
                flow.response.match_details = {
                    'route_id': route.id,
                    'filters': matched_filters,
                }

        except (RedactFailed, RevealFailed) as exc:
            logger.error(exc)

        except Exception as exc:
            logger.exception(exc)
