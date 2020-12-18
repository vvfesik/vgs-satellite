import logging
from typing import Dict

from mitmproxy.http import HTTPFlow

from . import Transformer, TransformerConfig, TransformerType
from .form_data import FormDataTransformer
from .json import JsonTransformer
from .regex import RegexTransformer
from .xml import XMLTransformer
from .. import ctx
from ..aliases import AliasGeneratorType, AliasStoreType, RevealFailed
from ..aliases.manager import redact,  reveal
from ..db.models.route import Operation, Phase, RuleEntry


logger = logging.getLogger()


def transform(flow: HTTPFlow, phase: Phase, rule_entry: RuleEntry) -> bool:
    def _redact(value: str) -> str:
        return redact(
            value,
            generator_type=AliasGeneratorType(rule_entry.public_token_generator),
            store_type=AliasStoreType(rule_entry.token_manager),
        ).public_alias

    def _reveal(value: str) -> str:
        try:
            return reveal(
                value,
                store_type=AliasStoreType(rule_entry.token_manager),
            ).value
        except RevealFailed as exc:
            logger.warning(f'Unable to reveal alias {value}: {exc}')
            return value

    config = TransformerConfig(
        rule_entry.transformer_config,
        rule_entry.transformer_config_map,
    )
    transformer = _transformers[rule_entry.transformer](config)

    phase_obj = getattr(flow, phase.value.lower())
    content = phase_obj.content.decode()

    operation = (
        _redact
        if rule_entry.operation == Operation.REDACT.value
        else _reveal
    )

    flow_ctx = ctx.use_context(ctx.FlowContext(flow=flow, phase=phase))
    route_ctx = ctx.use_context(ctx.RouteContext(route=rule_entry.rule_chain))
    with flow_ctx, route_ctx:
        transformed = transformer.transform(content, operation)

    # TODO: transformer.transform() should return a transformation status flag
    if transformed != content:
        phase_obj.text = transformed
        return True

    return False


_transformers: Dict[TransformerType, Transformer] = {
    TransformerType.JSON_PATH: JsonTransformer,
    TransformerType.FORM_FIELD: FormDataTransformer,
    TransformerType.XPATH: XMLTransformer,
    TransformerType.REGEX: RegexTransformer,
}
