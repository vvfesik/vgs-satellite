import logging

from typing import List, Tuple

from satellite.db.models.route import RuleEntry
from satellite.vault.transformer import transformer_map


logger = logging.getLogger()


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
            allowed_transformers = ', '.join(map(str, transformer_map.keys()))
            logger.warning(
                f'{transformer} can not be used as a transformer. '
                f'Possible values: {allowed_transformers}'
            )
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
