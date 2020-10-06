from satellite.controller import BaseHandler, apply_response_schema
import satellite.proxy.exceptions as proxy_exceptions
from satellite.schemas.flows import HTTPFlowSchema


class Index(BaseHandler):
    def head(self):
        self.set_status(200)
        self.finish()


class FlowHandler(BaseHandler):
    @apply_response_schema(HTTPFlowSchema)
    def get(self, flow_id):
        return self.application.proxy_manager.get_flow(flow_id)

    def delete(self, flow_id):
        self.application.proxy_manager.remove_flow(flow_id)

    def put(self, flow_id):
        try:
            self.application.proxy_manager.update_flow(flow_id, self.json)
        except proxy_exceptions.FlowUpdateError as exc:
            self.set_status(400, str(exc))


class DuplicateFlow(BaseHandler):
    def post(self, flow_id):
        new_flow_id = self.application.proxy_manager.duplicate_flow(flow_id)
        self.write(new_flow_id)


class ReplayFlow(BaseHandler):
    def post(self, flow_id):
        self.application.proxy_manager.replay_flow(flow_id)


class Flows(BaseHandler):
    @apply_response_schema(HTTPFlowSchema, many=True)
    def get(self):
        return self.application.proxy_manager.get_flows()
