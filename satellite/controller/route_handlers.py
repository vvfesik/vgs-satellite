from satellite.controller import (
    BaseHandler,
    apply_request_schema,
    apply_response_schema,
)
from satellite.routes import manager as route_manager
from satellite.schemas.route import CreateUpdateRouteSchema, RouteSchema


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
            self.set_status(400)
            self.finish(str(exc))


class RouteHandler(BaseHandler):

    @apply_response_schema(RouteSchema)
    def get(self, route_id):
        return route_manager.get(route_id)

    @apply_request_schema(CreateUpdateRouteSchema)
    @apply_response_schema(RouteSchema)
    def put(self, route_id, validated_data):
        try:
            return route_manager.update(
                route_id,
                validated_data['data']['attributes'],
            )
        except route_manager.EntityNotFound as exc:
            self.set_status(404)
            self.finish(str(exc))
        except route_manager.InvalidRouteConfiguration as exc:
            self.set_status(400)
            self.finish(str(exc))

    def delete(self, route_id):
        route_manager.delete(route_id)
        self.write('OK')
