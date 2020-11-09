import logging

from typing import Tuple

from mitmproxy.connections import ServerConnection
from mitmproxy.http import HTTPFlow

from satellite import ctx
from satellite.db.models.route import Phase
from satellite.proxy import audit_logs
from satellite.service.alias_manager import RedactFailed, RevealFailed
from satellite.vault.route_matcher import match_route
from satellite.vault.transformation_manager import transform_body


logger = logging.getLogger()


class VaultFlows:
    def serverconnect(self, conn: ServerConnection):
        conn.rfile.start_log()
        conn.wfile.start_log()

    def request(self, flow: HTTPFlow):
        try:
            audit_logs.emit(audit_logs.VaultRequestAuditLogRecord(
                flow_id=flow.id,
                proxy_mode=ctx.get_proxy_context().mode,
                method=flow.request.method,
                uri=flow.request.url,
            ))
            flow.request_raw = flow.request.copy()
            content, match_details = self._process(
                flow=flow,
                phase=Phase.REQUEST,
                content=flow.request.content,
            )
            if match_details:
                flow.request.text = content
                flow.request.match_details = match_details

        except (RedactFailed, RevealFailed) as exc:
            logger.error(exc)

        except Exception as exc:
            logger.exception(exc)

    def response(self, flow: HTTPFlow):
        try:
            proxy_context = ctx.get_proxy_context()

            for sock, label in [
                (flow.server_conn.wfile, audit_logs.TrafficLabel.TO_SERVER),
                (flow.server_conn.rfile, audit_logs.TrafficLabel.FROM_SERVER),
            ]:
                # TODO: (SAT-98) trigger TO_SERVER-event at the right time.
                audit_logs.emit(audit_logs.VaultTrafficLogRecord(
                    flow_id=flow.id,
                    proxy_mode=proxy_context.mode,
                    bytes=len(sock.get_log()),
                    label=label,
                ))
                sock.stop_log()

            audit_logs.emit(audit_logs.UpstreamResponseLogRecord(
                flow_id=flow.id,
                proxy_mode=proxy_context.mode,
                upstream=flow.request.host,
                status_code=flow.response.status_code,
            ))

            flow.response_raw = flow.response.copy()
            content, match_details = self._process(
                flow=flow,
                phase=Phase.RESPONSE,
                content=flow.response.content,
            )
            if match_details:
                flow.response.text = content
                flow.response.match_details = match_details

        except (RedactFailed, RevealFailed) as exc:
            logger.error(exc)

        except Exception as exc:
            logger.exception(exc)

    def _process(self, flow: HTTPFlow, phase: Phase, content: bytes) -> Tuple[str, dict]:
        route, route_filters = match_route(
            proxy_mode=ctx.get_proxy_context().mode,
            phase=phase,
            flow=flow,
        )
        if not route_filters:
            return content, None

        with ctx.use_context(ctx.FlowContext(flow=flow, phase=phase)), ctx.use_context(ctx.RouteContext(route=route)):
            # TODO: Encapsulate flow transformation somewere else
            content, ops_applications = transform_body(route_filters, content)
            matched_filters = [
                {'id': rule.id, 'operation_applied': op_applied}
                for rule, op_applied in zip(route_filters, ops_applications)
            ]
            return content, {'route_id': route.id, 'filters': matched_filters}
