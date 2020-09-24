from typing import List, Tuple

from mitmproxy import ctx

from satellite.model.route import RuleEntry
from satellite.vault.transformer import transformer_map


def transform_body(
    routes_filters: List[RuleEntry],
    content: bytes,
) -> Tuple[str, List[bool]]:
    content = content.decode()
    ops_application_flags = [False] * len(routes_filters)

    for rule_entry_idx, rule_entry in enumerate(routes_filters):
        transformer = rule_entry.transformer
        transformer_type = transformer_map.get(transformer)
        if not transformer_type:
            ctx.log.info(f'{transformer} can\'t be used as a transformer. '
                         f'Possible values: {str(transformer_map.keys())}')
            continue

        operation = rule_entry.operation
        token_generator = rule_entry.public_token_generator
        transformer_config = rule_entry.transformer_config
        transformed = transformer_type.transform(
            content,
            transformer_config,
            token_generator,
            operation,
        )

        if transformed != content:
            content = transformed
            ops_application_flags[rule_entry_idx] = True

    return content, ops_application_flags
