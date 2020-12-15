from marshmallow import Schema, fields, pre_load, validate

from marshmallow_enum import EnumField

from ..aliases import AliasGeneratorType


class RedactRequestSchema(Schema):
    class ValueToRedact(Schema):
        value = fields.Str(required=True)
        format = EnumField(AliasGeneratorType, by_value=True, required=True)

        @pre_load
        def prepare_value(self, data: dict, **kwargs) -> dict:
            if (
                isinstance(data, dict) and
                'value' in data and
                isinstance(data['value'], int)
            ):
                data = {**data, 'value': str(data['value'])}

            return data

    data = fields.List(
        fields.Nested(ValueToRedact),
        required=True,
        validate=validate.Length(1, 20),
    )


class RecordSchema(Schema):
    class Alias(Schema):
        alias = fields.Str(required=True)
        format = EnumField(AliasGeneratorType, by_value=True, required=True)
    value = fields.Str(required=True)
    aliases = fields.List(fields.Nested(Alias), required=True)
    created_at = fields.DateTime(required=True)


class Error(Schema):
    detail = fields.Str(required=True)


class AliasResponseSchema(Schema):
    data = fields.List(fields.Nested(RecordSchema))
    errors = fields.List(fields.Nested(Error))


class AliasesResponseSchema(Schema):
    data = fields.Dict(keys=fields.Str, values=fields.Nested(RecordSchema))
    errors = fields.List(fields.Nested(Error))
