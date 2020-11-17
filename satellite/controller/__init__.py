import json

from functools import wraps
from typing import Type

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


def apply_response_schema(schema_cls: Type[Schema], many: bool = False):
    def decorator(handler_method):
        @wraps(handler_method)
        def wrapper(handler: BaseHandler, *args, **kwargs):
            result = handler_method(handler, *args, **kwargs)
            if result is not None and not handler._finished:
                schema = schema_cls(many=many)
                handler.write(schema.dump(result))

        return wrapper

    return decorator


def apply_request_schema(schema_cls: Type[Schema]):
    def decorator(handler_method):
        @wraps(handler_method)
        def wrapper(handler: BaseHandler, *args, **kwargs):
            try:
                data = json.loads(handler.request.body)
            except json.JSONDecodeError as exc:
                handler.set_status(400, 'Invalid content type')
                handler.finish(str(exc))
                return

            schema = schema_cls()
            errors = schema.validate(data)
            if errors:
                handler.set_status(400, 'Invalid request data')
                handler.finish(json.dumps(errors))
                return

            validated_data = schema.load(data)

            return handler_method(
                handler,
                *args,
                validated_data=validated_data,
                **kwargs,
            )

        return wrapper

    return decorator


class APIError(tornado.web.HTTPError):
    pass
