import logging

from mitmproxy.http import HTTPFlow

from .. import ctx
from ..aliases import AliasGeneratorType, AliasStoreType
from ..aliases.manager import redact,  reveal
from ..db.models.route import Operation, Phase, RuleEntry
from ..vault.transformer import transformer_map


logger = logging.getLogger()


def transform(flow: HTTPFlow, phase: Phase, rule_entry: RuleEntry) -> bool:
    def _redact(value: str) -> str:
        return redact(
            value,
            generator_type=AliasGeneratorType(rule_entry.public_token_generator),
            store_type=AliasStoreType(rule_entry.token_manager),
        ).public_alias

    def _reveal(value: str) -> str:
        return reveal(
            value,
            store_type=AliasStoreType(rule_entry.token_manager),
        ).value

    transformer = transformer_map.get(rule_entry.transformer)
    if not transformer:
        allowed_transformers = ', '.join(map(str, transformer_map.keys()))
        logger.warning(
            f'{rule_entry.transformer} can not be used as a transformer. '
            f'Possible values: {allowed_transformers}'
        )
        return False

    phase_obj = getattr(flow, phase.value.lower())
    content = phase_obj.content.decode()

    operation = (
        _redact
        if rule_entry.operation == Operation.REDACT.value
        else _reveal
    )

    transformer_config = rule_entry.transformer_config
    flow_ctx = ctx.use_context(ctx.FlowContext(flow=flow, phase=phase))
    route_ctx = ctx.use_context(ctx.RouteContext(route=rule_entry.rule_chain))
    with flow_ctx, route_ctx:
        transformed = transformer.transform(
            payload=content,
            transformer_array=transformer_config,
            operation=operation,
        )

    # TODO: transformer.transform() should return a transformation status flag
    if transformed != content:
        phase_obj.text = transformed
        return True

    return False
