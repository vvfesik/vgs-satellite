from typing import Optional, Tuple

from ..service import alias_manager
from ..db.models.alias import RevealFailed
from ..schemas.aliases import (
    RedactRequestSchema,
    AliasResponseSchema,
    AliasesResponseSchema,
)
from . import (
    BaseHandler,
    apply_request_schema,
    apply_response_schema,
)


class AliasesHandler(BaseHandler):
    @apply_request_schema(RedactRequestSchema)
    @apply_response_schema(AliasResponseSchema)
    def post(self, validated_data: dict):
        results = []
        for item in validated_data['data']:
            value, format = item['value'], item['format']
            alias = alias_manager.redact(value, format)
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
            self.set_status(400, 'Invalid request data')
            self.finish('Missing required parameter: "q"')
            return

        reveal_data = {}
        errors = []
        for public_alias in set(aliases.split(',')):
            reveal_result, error = _reveal(public_alias)
            if reveal_result:
                reveal_data[public_alias] = reveal_result
            if error:
                errors.append(error)

        result = {}
        if reveal_data:
            result['data'] = reveal_data
        if errors:
            result['errors'] = errors

        return result


class AliasHandler(BaseHandler):
    @apply_response_schema(AliasResponseSchema)
    def get(self, public_alias: str):
        reveal_result, error = _reveal(public_alias)
        if error:
            self.set_status(400, 'Invalid request data')
            return {'errors': error}

        return {'data': [reveal_result]}


def _reveal(public_alias: str) -> Tuple[Optional[str], Optional[dict]]:
    try:
        alias = alias_manager.reveal(public_alias)
    except RevealFailed as exc:
        return None, {'detail': f'Unable to reveal {public_alias}: {exc}'}

    return {
        'aliases': [{
            'alias': alias.public_alias,
            'format': alias.alias_generator,
        }],
        'created_at': alias.created_at,
        'value': alias.value,
    }, None
