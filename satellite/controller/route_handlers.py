import tornado.escape

from satellite.controller import BaseHandler
from satellite.service import route_manager

from satellite.service.route_manager import EntityAlreadyExists


class RoutesHandler(BaseHandler):

    def get(self):
        self.set_json_headers()
        routes = route_manager.get_all_serialized()
        self.write(routes)

    def post(self):
        try:
            data = tornado.escape.json_decode(self.request.body)
            route = data['data']['attributes']
            route_entity = route_manager.create(route)
            self.write(route_entity)
        except EntityAlreadyExists as e:
            self.set_status(400)
            self.write(f'Entity with id={e} already exists')


class RouteHandler(BaseHandler):

    def get(self, route_id):
        self.set_json_headers()
        route = route_manager.get(route_id)
        self.write(route.serialize())

    def put(self, route_id):
        try:
            data = tornado.escape.json_decode(self.request.body)
            route = data['data']['attributes']
            route_entity = route_manager.update(route_id, route)
            self.write(route_entity)
        except EntityAlreadyExists as e:
            self.set_status(400)
            self.write(f'Entity with id={e} already exists')

    def delete(self, route_id):
        route_manager.delete(route_id)
        self.write('OK')
