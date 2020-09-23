from functools import wraps

import tornado.websocket

from marshmallow import Schema
from mitmproxy.tools.web.app import RequestHandler


class BaseHandler(RequestHandler):

    def set_default_headers(self):
        # super().set_default_headers()
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
        self.set_header('Access-Control-Allow-Headers', 'Accept, Content-Type')

    def set_json_headers(self):
        self.set_header("Accept", "application/vnd.api+json")
        self.set_header("Content-Type", "application/vnd.api+json")

    def options(self, flow_id='', route_id=''):
        self.set_status(200)
        self.finish()


def apply_response_schema(schema_cls: Schema, many: bool = False):
    def decorator(handler_method):
        @wraps(handler_method)
        def wrapper(handler: BaseHandler, *args, **kwargs):
            result = handler_method(handler, *args, **kwargs)
            schema = schema_cls(many=many)
            handler.write(schema.dump(result))
        return wrapper
    return decorator


class APIError(tornado.web.HTTPError):
    pass
