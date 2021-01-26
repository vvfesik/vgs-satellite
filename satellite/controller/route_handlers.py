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
        return route_manager.get_all()

    @apply_request_schema(CreateUpdateRouteSchema)
    @apply_response_schema(RouteSchema)
    def post(self, validated_data: dict):
        try:
            return route_manager.create(validated_data['data']['attributes'])
        except route_manager.InvalidRouteConfiguration as exc:
            raise ValidationError(str(exc))


class RouteHandler(BaseHandler):

    @apply_response_schema(RouteSchema)
    def get(self, route_id):
        route = route_manager.get(route_id)
        if not route:
            raise NotFoundError(f'Unknown route ID: {route_id}')
        return route

    @apply_request_schema(CreateUpdateRouteSchema)
    @apply_response_schema(RouteSchema)
    def put(self, route_id, validated_data):
        try:
            return route_manager.update(
                route_id,
                validated_data['data']['attributes'],
            )
        except route_manager.InvalidRouteConfiguration as exc:
            raise ValidationError(str(exc))

    def delete(self, route_id):
        try:
            route_manager.delete(route_id)
        except route_manager.EntityNotFound:
            raise NotFoundError(f'Unknown route ID: {route_id}')
