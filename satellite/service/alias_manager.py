import uuid

from functools import partial
from typing import Optional

from satellite import ctx

from ..db import get_session
from ..db.models.alias import Alias, RevealFailed, RedactFailed
from ..proxy import audit_logs
from ..vault.generator import generator_map


def get_by_value(value: str) -> Optional[Alias]:
    return get_session().query(Alias).filter(Alias.value == value).first()


def get_by_alias(alias: str) -> Optional[Alias]:
    return get_session().query(Alias).filter(Alias.public_alias == alias).first()


def redact(value: str, alias_generator: str) -> str:
    flow_context = ctx.get_flow_context()
    make_log_record = partial(
        audit_logs.VaultRecordUsageLogRecord,
        alias_generator=alias_generator,
        flow_id=flow_context.flow.id,
        phase=flow_context.phase,
        proxy_mode=ctx.get_proxy_context().mode,
        route_id=ctx.get_route_context().route.id,
    )

    alias_entity = get_by_value(value)
    if alias_entity:
        audit_logs.emit(make_log_record(
            action_type=audit_logs.ActionType.DE_DUPE,
            record_id=alias_entity.id,
        ))
        return alias_entity.public_alias

    alias_generator_type = generator_map.get(alias_generator)
    alias_id = str(uuid.uuid4())
    if not alias_generator_type:
        raise RedactFailed(
            f'{alias_generator} can\'t be used as a alias generator. '
            f'Possible values: {str(alias_generator.keys())}'
        )
    public_alias = alias_generator_type.generate(alias_id)
    alias = Alias(
        id=alias_id,
        value=value,
        alias_generator=alias_generator,
        public_alias=public_alias,
    )
    session = get_session()
    session.add(alias)
    session.commit()

    audit_logs.emit(make_log_record(
        action_type=audit_logs.ActionType.CREATED,
        record_id=alias.id,
    ))

    return public_alias


def reveal(alias: str) -> str:
    alias_entity = get_by_alias(alias)
    if not alias_entity:
        raise RevealFailed('Alias was not found!')

    flow_context = ctx.get_flow_context()
    audit_logs.emit(audit_logs.VaultRecordUsageLogRecord(
        alias_generator=alias_entity.alias_generator,
        flow_id=flow_context.flow.id,
        phase=flow_context.phase,
        proxy_mode=ctx.get_proxy_context().mode,
        route_id=ctx.get_route_context().route.id,
        action_type=audit_logs.ActionType.RETRIEVED,
        record_id=alias_entity.id,
    ))

    return alias_entity.value
