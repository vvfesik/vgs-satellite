from satellite.controller import APIError, BaseHandler, apply_response_schema
import satellite.proxy.exceptions as proxy_exceptions
from satellite.schemas.flows import HTTPFlowSchema


class Index(BaseHandler):
    def head(self):
        self.set_status(200)
        self.finish()


class FlowHandler(BaseHandler):
    @apply_response_schema(HTTPFlowSchema)
    def get(self, flow_id):
        try:
            return self.application.proxy_manager.get_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise APIError(404, 'Unknown flow') from exc

    def delete(self, flow_id):
        try:
            self.application.proxy_manager.kill_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise APIError(404, 'Unknown flow') from exc
        except proxy_exceptions.UnkillableFlowError as exc:
            raise APIError(400, 'Unkillable flow') from exc

        self.set_status(200)

    def put(self, flow_id):
        try:
            self.application.proxy_manager.update_flow(flow_id, self.json)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise APIError(404, 'Unknown flow') from exc
        except proxy_exceptions.FlowUpdateError as exc:
            raise APIError(400, 'Unable to update flow') from exc


class DuplicateFlow(BaseHandler):
    def post(self, flow_id):
        try:
            new_flow_id = self.application.proxy_manager.duplicate_flow(flow_id)
        except proxy_exceptions.FlowDuplicationError as exc:
            raise APIError(400, 'Unable to duplicate flow') from exc
        self.write(new_flow_id)


class ReplayFlow(BaseHandler):
    def post(self, flow_id):
        try:
            self.application.proxy_manager.replay_flow(flow_id)
        except proxy_exceptions.FlowReplayError as exc:
            raise APIError(400, 'Unable to replay flow') from exc
        self.set_status(200)


class Flows(BaseHandler):
    @apply_response_schema(HTTPFlowSchema, many=True)
    def get(self):
        return self.application.proxy_manager.get_flows()
