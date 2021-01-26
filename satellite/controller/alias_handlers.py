from . import BaseHandler, apply_request_schema, apply_response_schema
from .exceptions import NotFoundError, ValidationError
from ..aliases import AliasNotFound, AliasStoreType
from ..aliases.manager import redact, reveal
from ..schemas.aliases import (
    AliasResponseSchema,
    AliasesResponseSchema,
    RedactRequestSchema,
)


STORAGE_TYPE = AliasStoreType.PERSISTENT


class AliasesHandler(BaseHandler):
    @apply_request_schema(RedactRequestSchema)
    @apply_response_schema(AliasResponseSchema)
    def post(self, validated_data: dict):
        results = []
        for item in validated_data['data']:
            value, format = item['value'], item['format']
            alias = redact(value, format, STORAGE_TYPE)
            results.append({
                'aliases': [{'alias': alias.public_alias, 'format': format}],
                'created_at': alias.created_at,
                'value': item['value'],
            })

        return {'data': results}

    @apply_response_schema(AliasesResponseSchema)
    def get(self):
        aliases = self.get_query_argument('q', default=None)
        if not aliases:
            raise ValidationError('Missing required parameter: "q"')

        reveal_data = {}
        errors = []
        for public_alias in set(aliases.split(',')):
            try:
                reveal_result = _reveal(public_alias)
            except AliasNotFound:
                errors.append({'message': f'Unknown alias: {public_alias}'})
            else:
                reveal_data[public_alias] = reveal_result

        result = {}
        if reveal_data:
            result['data'] = reveal_data
        if errors:
            result['errors'] = errors

        return result


class AliasHandler(BaseHandler):
    @apply_response_schema(AliasResponseSchema)
    def get(self, public_alias: str):
        try:
            reveal_result = _reveal(public_alias)
        except AliasNotFound:
            raise NotFoundError(f'Unknown alias: {public_alias}')

        return {'data': [reveal_result]}


def _reveal(public_alias: str) -> str:
    alias = reveal(public_alias, STORAGE_TYPE)
    return {
        'aliases': [{
            'alias': alias.public_alias,
            'format': alias.alias_generator,
        }],
        'created_at': alias.created_at,
        'value': alias.value,
    }
