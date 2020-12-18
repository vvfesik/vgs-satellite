from marshmallow import EXCLUDE, Schema, fields, validate

from marshmallow_enum import EnumField

from ..operations.operations import get_supported_operations
from ..transformers import TransformerType


class RuleEntrySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    class Operation(Schema):
        name = fields.Str(
            required=True,
            validate=validate.OneOf(get_supported_operations()),
        )
        parameters = fields.Dict(required=True)

    # TODO: (SAT-108) Determine which fields are required.
    id = fields.Str()
    created_at = fields.DateTime()
    phase = fields.Str()
    operation = fields.Str()
    token_manager = fields.Str()
    public_token_generator = fields.Str()
    transformer = EnumField(TransformerType, by_value=True)
    transformer_config = fields.Raw()
    transformer_config_map = fields.Raw(allow_none=True)
    targets = fields.Raw()
    classifiers = fields.Raw()
    config = fields.Raw(attribute='expression_snapshot')
    operations_v2 = fields.List(
        fields.Nested(Operation),
        allow_none=True,
    )


class RouteSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    # TODO: (SAT-108) Determine which fields are required.
    id = fields.Str()
    created_at = fields.DateTime()
    protocol = fields.Str()
    source_endpoint = fields.Str()
    destination_override_endpoint = fields.Str()
    host_endpoint = fields.Str()
    port = fields.Int(allow_none=True)
    tags = fields.Raw()
    entries = fields.List(
        fields.Nested(RuleEntrySchema),
        attribute='rule_entries_list',
    )


class CreateUpdateRouteSchema(Schema):
    class Data(Schema):
        class Route(RouteSchema):
            entries = fields.List(
                fields.Nested(RuleEntrySchema(exclude=['created_at'])),
                attribute='rule_entries_list',
            )

        attributes = fields.Nested(
            Route(exclude=['created_at']),
            required=True,
        )
        type = fields.Str()

    data = fields.Nested(Data, required=True)
