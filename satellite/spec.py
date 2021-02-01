from typing import Callable, List, Tuple

from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin, OpenAPIConverter

from apispec_webframeworks.tornado import TornadoPlugin

from marshmallow.fields import Field

from marshmallow_enum import EnumField


def build_openapi_spec(handlers: List[Tuple[str, Callable]]) -> APISpec:
    marshmallow_plugin = MarshmallowPlugin()
    spec = APISpec(
        title='VGS Satellite management API',
        version='1.0.0',
        openapi_version='3.0.2',
        info={'description': 'The management API for VGS Satellite app'},
        plugins=[TornadoPlugin(), marshmallow_plugin],
    )

    marshmallow_plugin.converter.add_attribute_function(_field_to_spec_pros)

    for urlspec in handlers:
        spec.path(urlspec=urlspec)

    return spec


def _field_to_spec_pros(
    converter: OpenAPIConverter,
    field: Field,
    ret: dict,
) -> dict:
    if isinstance(field, EnumField):
        return {
            **ret,
            'enum': [member.value for member in field.enum],
            'type': 'string',
        }
    return ret
