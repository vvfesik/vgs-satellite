from . import (
    BaseHandler,
    apply_request_schema,
    apply_response_schema,
)
from .exceptions import NotFoundError, ValidationError
from ..routes import manager as route_manager
from ..schemas.route import CreateUpdateRouteSchema, RouteSchema


class RoutesHandler(BaseHandler):

    @apply_response_schema(RouteSchema, many=True)
    def get(self):
        """
        ---
        description: Retrieve all routes
        responses:
            200:
                content:
                    application/json:
                        schema:
                            type: array
                            items: RouteSchema
        """
        return route_manager.get_all()

    @apply_request_schema(CreateUpdateRouteSchema)
    @apply_response_schema(RouteSchema)
    def post(self, validated_data: dict):
        """
        ---
        description: Create a new route
        requestBody:
            content:
                application/json:
                    schema: CreateUpdateRouteSchema
        responses:
            200:
                content:
                    application/json:
                        schema: RouteSchema
            400:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            return route_manager.create(validated_data['data']['attributes'])
        except route_manager.InvalidRouteConfiguration as exc:
            raise ValidationError(str(exc))


class RouteHandler(BaseHandler):

    @apply_response_schema(RouteSchema)
    def get(self, route_id: str):
        """
        ---
        description: Retrieve a single route
        parameters:
            - name: route_id
              in: path
              description: Route ID
              required: true
              schema:
                  type: string
        responses:
            200:
                content:
                    application/json:
                        schema: RouteSchema
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        route = route_manager.get(route_id)
        if not route:
            raise NotFoundError(f'Unknown route ID: {route_id}')
        return route

    @apply_request_schema(CreateUpdateRouteSchema)
    @apply_response_schema(RouteSchema)
    def put(self, route_id: str, validated_data: dict):
        """
        ---
        description: Update a route
        parameters:
            - name: route_id
              in: path
              description: Route ID
              required: true
              schema:
                  type: string
        requestBody:
            content:
                application/json:
                    schema: CreateUpdateRouteSchema
        responses:
            200:
                content:
                    application/json:
                        schema: RouteSchema
            400:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            return route_manager.update(
                route_id,
                validated_data['data']['attributes'],
            )
        except route_manager.InvalidRouteConfiguration as exc:
            raise ValidationError(str(exc))

    def delete(self, route_id: str):
        """
        ---
        description: Retrieve a single route
        parameters:
            - name: route_id
              in: path
              description: Route ID
              required: true
              schema:
                  type: string
        responses:
            200:
                content:
                    application/json:
                        schema: RouteSchema
            404:
                content:
                    application/json:
                        schema: ErrorResponseSchema
        """
        try:
            route_manager.delete(route_id)
        except route_manager.EntityNotFound:
            raise NotFoundError(f'Unknown route ID: {route_id}')
