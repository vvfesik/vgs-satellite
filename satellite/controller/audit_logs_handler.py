from ..audit_logs.store import UnknownFlowIdError
from ..controller import BaseHandler, apply_response_schema
from ..controller.exceptions import NotFoundError
from ..schemas.audit_logs import AuditLogsResponseSchema


class AuditLogsHandler(BaseHandler):
    @apply_response_schema(AuditLogsResponseSchema)
    def get(self, flow_id: str):
        try:
            logs = self.application.proxy_manager.get_audit_logs(flow_id)
        except UnknownFlowIdError:
            raise NotFoundError(f'Unknown flow ID: {flow_id}')
        return {'logs': logs}
