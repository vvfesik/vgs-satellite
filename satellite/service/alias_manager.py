import uuid
from functools import partial
from typing import Optional

from satellite import ctx

from .. import audit_logs
from ..db import get_session
from ..db.models.alias import Alias, RevealFailed
from ..vault.generator import get_generator


def get_by_value(value: str) -> Optional[Alias]:
    return get_session().query(Alias).filter(Alias.value == value).first()


def get_by_alias(alias: str) -> Optional[Alias]:
    return get_session().query(Alias).filter(Alias.public_alias == alias).first()


def redact(value: str, generator_type: str) -> Alias:
    make_log_record = None
    flow_context = ctx.get_flow_context()
    if flow_context:
        make_log_record = partial(
            audit_logs.records.VaultRecordUsageLogRecord,
            alias_generator=generator_type,
            flow_id=flow_context.flow.id,
            phase=flow_context.phase,
            proxy_mode=ctx.get_proxy_context().mode,
            route_id=ctx.get_route_context().route.id,
        )

    alias_entity = get_by_value(value)
    if alias_entity:
        if make_log_record:
            audit_logs.emit(make_log_record(
                action_type=audit_logs.records.ActionType.DE_DUPE,
                record_id=alias_entity.id,
            ))
        return alias_entity

    generator = get_generator(generator_type)
    alias_id = str(uuid.uuid4())
    alias = Alias(
        id=alias_id,
        value=value,
        alias_generator=generator_type,
        public_alias=generator.generate(alias_id),
    )
    session = get_session()
    session.add(alias)
    session.commit()

    if make_log_record:
        audit_logs.emit(make_log_record(
            action_type=audit_logs.records.ActionType.CREATED,
            record_id=alias.id,
        ))

    return alias


def reveal(alias: str) -> Alias:
    alias_entity = get_by_alias(alias)
    if not alias_entity:
        raise RevealFailed('Alias was not found!')

    flow_context = ctx.get_flow_context()
    if flow_context:
        audit_logs.emit(audit_logs.records.VaultRecordUsageLogRecord(
            alias_generator=alias_entity.alias_generator,
            flow_id=flow_context.flow.id,
            phase=flow_context.phase,
            proxy_mode=ctx.get_proxy_context().mode,
            route_id=ctx.get_route_context().route.id,
            action_type=audit_logs.records.ActionType.RETRIEVED,
            record_id=alias_entity.id,
        ))

    return alias_entity
