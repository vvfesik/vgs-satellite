import logging

from mitmproxy.connections import ServerConnection
from mitmproxy.http import HTTPFlow

from satellite import audit_logs, ctx
from satellite.aliases import RedactFailed, RevealFailed
from satellite.db.models.route import Phase
from satellite.operations.pipeline import build_pipeline
from satellite.transformers.manager import transform
from satellite.vault.route_matcher import match_route


logger = logging.getLogger()


class VaultFlows:
    def serverconnect(self, conn: ServerConnection):
        conn.rfile.start_log()
        conn.wfile.start_log()

    def request(self, flow: HTTPFlow):
        try:
            audit_logs.emit(audit_logs.records.VaultRequestAuditLogRecord(
                flow_id=flow.id,
                proxy_mode=ctx.get_proxy_context().mode,
                method=flow.request.method,
                uri=flow.request.url,
            ))
            flow.request_raw = flow.request.copy()
            self._process(flow, Phase.REQUEST)

        except (RedactFailed, RevealFailed) as exc:
            logger.error(exc)

        except Exception as exc:
            logger.exception(exc)

    def response(self, flow: HTTPFlow):
        try:
            proxy_context = ctx.get_proxy_context()

            for sock, label in [
                (flow.server_conn.wfile, audit_logs.records.TrafficLabel.TO_SERVER),
                (flow.server_conn.rfile, audit_logs.records.TrafficLabel.FROM_SERVER),
            ]:
                if sock and sock.is_logging():
                    # TODO: (SAT-98) trigger TO_SERVER-event at the right time.
                    audit_logs.emit(audit_logs.records.VaultTrafficLogRecord(
                        flow_id=flow.id,
                        proxy_mode=proxy_context.mode,
                        bytes=len(sock.get_log()),
                        label=label,
                    ))
                    sock.stop_log()

            audit_logs.emit(audit_logs.records.UpstreamResponseLogRecord(
                flow_id=flow.id,
                proxy_mode=proxy_context.mode,
                upstream=flow.request.host,
                status_code=flow.response.status_code,
            ))

            flow.response_raw = flow.response.copy()
            self._process(flow, Phase.RESPONSE)

        except (RedactFailed, RevealFailed) as exc:
            logger.error(exc)

        except Exception as exc:
            logger.exception(exc)

    def _process(self, flow: HTTPFlow, phase: Phase):
        route, filters = match_route(
            proxy_mode=ctx.get_proxy_context().mode,
            phase=phase,
            flow=flow,
        )
        if not route:
            return

        match_details = {'filters': [], 'route_id': route.id}
        matched_filters = match_details['filters']
        for fltr in filters:
            if fltr.has_operations:
                pipeline = build_pipeline(fltr)
                pipeline.evaluate(flow, phase)
                operation_applied = True
            else:
                operation_applied = transform(flow, phase, fltr)
            matched_filters.append({
                'id': fltr.id,
                'operation_applied': operation_applied,
            })

        phase_obj = getattr(flow, phase.value.lower())
        phase_obj.match_details = match_details
