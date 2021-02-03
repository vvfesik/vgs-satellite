from . import BaseHandler, apply_request_schema, apply_response_schema
from .exceptions import NotFoundError, ValidationError
from ..proxy import exceptions as proxy_exceptions
from ..schemas.flows import (
    DuplicateFlowResponseSchema,
    FlowUpdateRequestSchema,
    HTTPFlowSchema,
)


class FlowHandler(BaseHandler):
    @apply_response_schema(HTTPFlowSchema)
    def get(self, flow_id: str):
        """
        ---
        description: Retrieve HTTP flow by ID
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
                        schema: HTTPFlowSchema
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            return self.application.proxy_manager.get_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))

    def delete(self, flow_id: str):
        """
        ---
        description: Delete HTTP flow
        parameters:
            - name: flow_id
              in: path
              description: Flow ID
              required: true
              schema:
                type: string
        responses:
            204:
                description: Flow was successfully deleted
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            self.application.proxy_manager.remove_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))

        self.finish_empty_ok()

    @apply_request_schema(FlowUpdateRequestSchema)
    def put(self, flow_id: str, validated_data: dict):
        """
        ---
        description: Update HTTP flow
        parameters:
            - name: flow_id
              in: path
              description: Flow ID
              required: true
              schema:
                type: string
        requestBody:
            content:
                application/json:
                    schema: FlowUpdateRequestSchema
        responses:
            204:
                description: Flow was successfully updated
            400:
                content:
                    application/json:
                        schema: ErrorResponseSchema
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            self.application.proxy_manager.update_flow(flow_id, validated_data)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))
        except proxy_exceptions.FlowUpdateError as exc:
            raise ValidationError(str(exc))

        self.finish_empty_ok()


class DuplicateFlow(BaseHandler):
    @apply_response_schema(DuplicateFlowResponseSchema)
    def post(self, flow_id: str):
        """
        ---
        description: Duplicate HTTP flow
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
                        schema: DuplicateFlowResponseSchema
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            new_flow_id = self.application.proxy_manager.duplicate_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))

        return {'id': new_flow_id}


class ReplayFlow(BaseHandler):
    def post(self, flow_id: str):
        """
        ---
        description: Replay HTTP flow
        parameters:
            - name: flow_id
              in: path
              description: Flow ID
              required: true
              schema:
                type: string
        responses:
            204:
                description: Flow was successfully replayed
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            self.application.proxy_manager.replay_flow(flow_id)
        except proxy_exceptions.UnexistentFlowError as exc:
            raise NotFoundError(str(exc))

        self.finish_empty_ok()


class Flows(BaseHandler):
    @apply_response_schema(HTTPFlowSchema, many=True)
    def get(self):
        """
        ---
        description: Retrieve all HTTP flows
        responses:
            200:
                content:
                    application/json:
                        schema:
                            type: array
                            items: HTTPFlowSchema
        """
        return self.application.proxy_manager.get_flows()
