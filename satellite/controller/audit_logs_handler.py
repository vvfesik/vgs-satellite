from tornado.web import HTTPError

from satellite.audit_logs.store import UnknownFlowIdError
from satellite.controller import BaseHandler, apply_response_schema
from satellite.schemas.audit_logs import AuditLogsResponseSchema


class AuditLogsHandler(BaseHandler):
    @apply_response_schema(AuditLogsResponseSchema)
    def get(self, flow_id: str):
        try:
            logs = self.application.proxy_manager.get_audit_logs(flow_id)
        except UnknownFlowIdError as exc:
            raise HTTPError(404, reason=str(exc))
        return {'logs': logs}
