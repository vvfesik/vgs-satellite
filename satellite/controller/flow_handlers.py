from . import BaseHandler, apply_response_schema
from .exceptions import NotFoundError, ValidationError
from ..proxy import exceptions as proxy_exceptions
from ..schemas.flows import HTTPFlowSchema


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
            raise NotFoundError(str(exc))

    def delete(self, flow_id):
        try:
            self.application.proxy_manager.remove_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))

    def put(self, flow_id):
        try:
            self.application.proxy_manager.update_flow(flow_id, self.json())
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))
        except proxy_exceptions.FlowUpdateError as exc:
            raise ValidationError(str(exc))


class DuplicateFlow(BaseHandler):
    def post(self, flow_id):
        try:
            new_flow_id = self.application.proxy_manager.duplicate_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))
        self.write(new_flow_id)


class ReplayFlow(BaseHandler):
    def post(self, flow_id):
        try:
            self.application.proxy_manager.replay_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))


class Flows(BaseHandler):
    @apply_response_schema(HTTPFlowSchema, many=True)
    def get(self):
        return self.application.proxy_manager.get_flows()
