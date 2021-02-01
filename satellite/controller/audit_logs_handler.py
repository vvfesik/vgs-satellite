from ..audit_logs.store import UnknownFlowIdError
from ..controller import BaseHandler, apply_response_schema
from ..controller.exceptions import NotFoundError
from ..schemas.audit_logs import AuditLogsResponseSchema


class AuditLogsHandler(BaseHandler):
    @apply_response_schema(AuditLogsResponseSchema)
    def get(self, flow_id: str):
        """
        ---
        description: Retrieve audit logs for an HTTP flow
        parameters:
            - name: flow_id
              in: path
              description: Flow ID
              required: true
              schema:
                type: string
        responses:
            200:
                content:
                    application/json:
                        schema: AuditLogsResponseSchema
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            logs = self.application.proxy_manager.get_audit_logs(flow_id)
        except UnknownFlowIdError:
            raise NotFoundError(f'Unknown flow ID: {flow_id}')
        return {'logs': logs}
