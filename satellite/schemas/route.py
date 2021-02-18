from marshmallow import EXCLUDE, Schema, fields, validate
from marshmallow_enum import EnumField

from ..aliases import AliasGeneratorType, AliasStoreType
from ..operations.operations import get_supported_operations
from ..routes import Operation, Phase
from ..transformers import TransformerType


class RuleEntrySchema(Schema):
    class OperationSchema(Schema):
        name = fields.Str(
            required=True,
            validate=validate.OneOf(get_supported_operations()),
        )
        parameters = fields.Dict(required=True)

    id = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    phase = EnumField(Phase, by_value=True, required=True)
    operation = EnumField(Operation, by_value=True, required=True)
    token_manager = EnumField(AliasStoreType, by_value=True, required=True)
    public_token_generator = EnumField(AliasGeneratorType, by_value=True, required=True)
    transformer = EnumField(TransformerType, by_value=True, required=True)
    transformer_config = fields.List(fields.Str())
    transformer_config_map = fields.Dict(allow_none=True)
    targets = fields.List(fields.Str())
    classifiers = fields.Dict()
    config = fields.Raw(attribute='expression_snapshot')
    operations = fields.List(fields.Nested(OperationSchema), allow_none=True)


class RouteSchema(Schema):
    id = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    protocol = fields.Str(required=True)
    source_endpoint = fields.Str(required=True)
    destination_override_endpoint = fields.Str(required=True)
    host_endpoint = fields.Str(required=True)
    port = fields.Int(allow_none=True)
    tags = fields.Raw()
    entries = fields.List(
        fields.Nested(RuleEntrySchema),
        attribute='rule_entries_list',
    )


class CreateRouteSchema(RouteSchema):
    class Meta:
        unknown = EXCLUDE
        exclude = ['created_at']

    class CreateRuleEntry(RuleEntrySchema):
        class Meta:
            unknown = EXCLUDE
            exclude = ['created_at']

        id = fields.Str()

    id = fields.Str()
    entries = fields.List(
        fields.Nested(CreateRuleEntry),
        attribute='rule_entries_list',
    )


class CreateRouteRequestSchema(Schema):
    class CreateRouteData(Schema):
        attributes = fields.Nested(CreateRouteSchema, required=True)
        type = fields.Str()

    data = fields.Nested(CreateRouteData, required=True)


class UpdateRouteSchema(CreateRouteRequestSchema):
    def __init__(self, **kwargs):
        super().__init__(partial=True, **kwargs)
