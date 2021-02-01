from marshmallow import EXCLUDE, Schema, fields, validate

from marshmallow_enum import EnumField

from ..aliases import AliasGeneratorType, AliasStoreType
from ..operations.operations import get_supported_operations
from ..routes import Operation, Phase
from ..transformers import TransformerType


class RuleEntrySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    class OperationSchema(Schema):
        name = fields.Str(
            required=True,
            validate=validate.OneOf(get_supported_operations()),
        )
        parameters = fields.Dict(required=True)

    # TODO: (SAT-108) Determine which fields are required.
    id = fields.Str()
    created_at = fields.DateTime()
    phase = EnumField(Phase, by_value=True)
    operation = EnumField(Operation, by_value=True)
    token_manager = EnumField(AliasStoreType, by_value=True)
    public_token_generator = EnumField(AliasGeneratorType, by_value=True)
    transformer = EnumField(TransformerType, by_value=True)
    transformer_config = fields.Raw()
    transformer_config_map = fields.Raw(allow_none=True)
    targets = fields.Raw()
    classifiers = fields.Raw()
    config = fields.Raw(attribute='expression_snapshot')
    operations = fields.List(fields.Nested(OperationSchema), allow_none=True)


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
    class CreateUpdateRouteData(Schema):
        class CreateUpdateRouteAttributes(RouteSchema):
            class Meta:
                exclude = ['created_at']
                unknown = EXCLUDE

            class CreateUpdateRuleEntryAttributes(RuleEntrySchema):
                class Meta:
                    exclude = ['created_at']
                    unknown = EXCLUDE

            entries = fields.List(
                fields.Nested(CreateUpdateRuleEntryAttributes),
                attribute='rule_entries_list',
            )

        attributes = fields.Nested(CreateUpdateRouteAttributes, required=True)
        type = fields.Str()

    data = fields.Nested(CreateUpdateRouteData, required=True)
