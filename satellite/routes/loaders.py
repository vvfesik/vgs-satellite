from typing import TextIO

from marshmallow import Schema, fields, validate
from ruamel.yaml import YAML
from sqlalchemy.exc import DatabaseError

from satellite.schemas.route import CreateRouteSchema
from . import manager as route_manager


class YAMLSchema(Schema):
    class Route(Schema):
        id = fields.Str(required=True)
        attributes = fields.Nested(CreateRouteSchema, required=True)
        type = fields.Constant('rule_chain')

    data = fields.List(
        fields.Nested(Route),
        required=True,
        validate=validate.Length(min=1),
    )
    version = fields.Int(required=True)


class LoadError(Exception):
    pass


def load_from_yaml(stream: TextIO) -> int:
    try:
        data = YAML().load(stream)
    except Exception as exc:
        raise LoadError(f'Unable to parse config: {exc}') from exc

    schema = YAMLSchema()
    errors = schema.validate(data)
    if errors:
        raise LoadError(f'Invalid routes data: {errors}')

    validated_data = schema.load(data)

    routes = [route['attributes'] for route in validated_data['data']]
    try:
        route_manager.replace(routes)
    except route_manager.InvalidRouteConfiguration as exc:
        raise LoadError(f'Invalid routes config: {exc}') from exc
    except DatabaseError as exc:
        raise LoadError(f'Unable to load routes into the DB: {exc}') from exc

    return len(routes)
