import json
from functools import wraps
from typing import Any, Type

from marshmallow import Schema

from tornado.escape import json_encode
from tornado.web import HTTPError, RequestHandler

from . import exceptions
from ..schemas.error import ErrorResponseSchema


class BaseHandler(RequestHandler):
    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Headers', 'Accept, Content-Type')
        methods = [
            method.upper()
            for method in ['delete', 'get', 'head', 'options', 'patch',  'post', 'put']
            if getattr(self, method).__name__ != '_unimplemented_method'
        ]
        if methods:
            self.set_header('Access-Control-Allow-Methods', ', '.join(methods))

    def json(self):
        content_type = self.request.headers.get('Content-Type', '')
        if not content_type.startswith('application/json'):
            raise exceptions.ValidationError(
                'Invalid Content-Type, expected application/json.'
            )
        try:
            return json.loads(self.request.body.decode())
        except json.JSONDecodeError:
            raise exceptions.ValidationError('Malformed JSON')

    def write(self, chunk: Any):
        if isinstance(chunk, list):
            chunk = json_encode(chunk)
            self.set_header('Content-Type', 'application/json')
        super().write(chunk)

    def options(self, *args, **kwargs):
        self.set_status(200)
        self.finish()

    def write_error(self, status_code: int, **kwargs):
        exc_info = kwargs.get('exc_info')
        if not exc_info:
            return super().write_error(status_code, **kwargs)

        exc = exc_info[1]
        if not isinstance(exc, exceptions.APIError):
            if isinstance(exc, HTTPError) and exc.status_code == 405:
                exc = exceptions.InvalidMethod()
            else:
                exc = exceptions.InternalError()

        self.set_status(exc.status_code, exc.reason)
        self.set_header('Content-type', 'application/json')
        self.finish(ErrorResponseSchema().dumps(exc))

    def finish_empty_ok(self):
        self.set_status(204, 'Success')
        self.finish()


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
            data = handler.json()
            schema = schema_cls()
            errors = schema.validate(data)
            if errors:
                raise exceptions.ValidationError('Invalid request data',  errors)

            validated_data = schema.load(data)

            return handler_method(
                handler,
                *args,
                validated_data=validated_data,
                **kwargs,
            )

        return wrapper

    return decorator
