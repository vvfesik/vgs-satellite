from marshmallow import Schema, fields, post_dump, pre_dump

from ..controller.exceptions import APIError


class ErrorSchema(Schema):
    class Error(Schema):
        reason = fields.Str(required=True)
        message = fields.Str()
        details = fields.Dict()

        @post_dump
        def remove_nones(self, error: dict, many: bool):
            return {k: v for k, v in error.items() if v is not None}

    error = fields.Nested(Error)

    @pre_dump
    def wrap_error(self, error: APIError, many: bool):
        return {'error': error}
