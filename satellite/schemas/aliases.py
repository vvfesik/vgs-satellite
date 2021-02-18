from marshmallow import Schema, fields, pre_load, validate
from marshmallow_enum import EnumField

from ..aliases import AliasGeneratorType


class RedactRequestSchema(Schema):
    class ValueToRedact(Schema):
        value = fields.Str(
            required=True,
            metadata={
                'description': 'Value to redact',
                'example': '4111111111111111',
            },
        )
        format = EnumField(
            AliasGeneratorType,
            by_value=True,
            required=True,
            metadata={
                'description': 'Alias format',
                'example': 'FPE_SIX_T_FOUR',
            },
        )

        @pre_load
        def prepare_value(self, data: dict, **kwargs) -> dict:
            if (
                isinstance(data, dict)
                and 'value' in data
                and isinstance(data['value'], int)
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
        alias = fields.Str(
            required=True,
            metadata={
                'description': 'Alias value',
                'example': '4111119935751111',
            },
        )
        format = EnumField(
            AliasGeneratorType,
            by_value=True,
            required=True,
            metadata={
                'description': 'Alias format',
                'example': 'FPE_SIX_T_FOUR',
            },
        )

    value = fields.Str(
        required=True,
        metadata={
            'description': 'Original value',
            'example': '4111111111111111',
        },
    )
    aliases = fields.List(
        fields.Nested(Alias),
        metadata={'description': 'Aliases created for the value'},
        required=True,
    )
    created_at = fields.DateTime(required=True)


class AliasResponseSchema(Schema):
    data = fields.List(fields.Nested(RecordSchema))


class AliasesResponseSchema(Schema):
    class AliasError(Schema):
        detail = fields.Str(required=True)

    data = fields.Dict(keys=fields.Str, values=fields.Nested(RecordSchema))
    errors = fields.List(fields.Nested(AliasError))
