from functools import wraps

import tornado.websocket

from marshmallow import Schema
from mitmproxy.tools.web.app import RequestHandler

from ..proxy import exceptions


PROXY_ERRORS_MAPPING = [
    (exceptions.UnexistentFlowError, 404, 'Unknown flow'),
    (exceptions.ProxyError, 500, 'Unknown proxy error'),
]


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

    def write_error(self, status_code: int, **kwargs):
        exc_info = kwargs.get('exc_info')
        if exc_info and isinstance(exc_info[1], exceptions.ProxyError):
            if self._handle_proxy_error(exc_info[1]):
                return
        super().write_error(status_code, **kwargs)

    def _handle_proxy_error(self, exc: exceptions.ProxyError):
        for exc_cls, status, reason in PROXY_ERRORS_MAPPING:
            if isinstance(exc, exc_cls):
                self.set_status(status, reason)
                self.write(reason)
                return True
        return False


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
