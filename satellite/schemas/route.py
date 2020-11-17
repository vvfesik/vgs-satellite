from marshmallow import EXCLUDE, fields, Schema


class RuleEntrySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    # TODO: (SAT-108) Determine which fields are required.
    phase = fields.Str()
    operation = fields.Str()
    token_manager = fields.Str()
    public_token_generator = fields.Str()
    transformer = fields.Str()
    transformer_config = fields.Raw()
    targets = fields.Raw()
    classifiers = fields.Raw()
    config = fields.Raw(attribute='expression_snapshot')


class RouteSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    # TODO: (SAT-108) Determine which fields are required.
    protocol = fields.Str()
    source_endpoint = fields.Str()
    destination_override_endpoint = fields.Str()
    host_endpoint = fields.Str()
    port = fields.Int()
    tags = fields.Raw()
    entries = fields.List(
        fields.Nested(RuleEntrySchema),
        attribute='rule_entries_list',
    )


class CreateRouteSchema(Schema):
    class Data(Schema):
        class Route(RouteSchema):
            entries = fields.List(
                fields.Nested(RuleEntrySchema(exclude=['id', 'created_at'])),
                attribute='rule_entries_list',
            )

        attributes = fields.Nested(
            Route(exclude=['id', 'created_at']),
            required=True,
        )
        type = fields.Str()

    data = fields.Nested(Data, required=True)


class UpdateRouteSchema(Schema):
    class Data(Schema):
        class Route(RouteSchema):
            entries = fields.List(
                fields.Nested(RuleEntrySchema(exclude=['created_at'])),
                attribute='rule_entries_list',
            )

        attributes = fields.Nested(
            Route(exclude=['id', 'created_at']),
            required=True,
        )
        type = fields.Str()

    data = fields.Nested(Data, required=True)
