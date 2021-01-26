import uuid
from functools import partial

from satellite.config import get_config

from . import AliasGeneratorType, AliasNotFound, AliasStoreType
from .generators import get_alias_generator
from .store import AliasStore
from .. import audit_logs
from .. import ctx
from ..db.models.alias import Alias


def redact(
    value: str,
    generator_type: AliasGeneratorType,
    store_type: AliasStoreType,
) -> Alias:
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
            record_type=store_type,
        )

    alias_store = _get_store(store_type)
    aliases = alias_store.get_by_value(value, generator_type)
    if aliases:
        alias = aliases[0]
        if make_log_record:
            audit_logs.emit(make_log_record(
                action_type=audit_logs.records.ActionType.DE_DUPE,
                record_id=alias.id,
            ))
        return alias

    generator = get_alias_generator(generator_type)
    alias_id = str(uuid.uuid4())
    alias = Alias(
        id=alias_id,
        value=value,
        alias_generator=generator_type,
        public_alias=generator.generate(value),
    )
    alias_store.save(alias)

    if make_log_record:
        audit_logs.emit(make_log_record(
            action_type=audit_logs.records.ActionType.CREATED,
            record_id=alias.id,
        ))

    return alias


def reveal(alias: str, store_type: AliasStoreType) -> Alias:
    alias_store = _get_store(store_type)
    alias_entity = alias_store.get_by_alias(alias)
    if not alias_entity:
        raise AliasNotFound('Alias was not found!')

    flow_context = ctx.get_flow_context()
    if flow_context:
        audit_logs.emit(audit_logs.records.VaultRecordUsageLogRecord(
            alias_generator=alias_entity.alias_generator,
            flow_id=flow_context.flow.id,
            phase=flow_context.phase,
            proxy_mode=ctx.get_proxy_context().mode,
            route_id=ctx.get_route_context().route.id,
            action_type=audit_logs.records.ActionType.RETRIEVED,
            record_type=store_type,
            record_id=alias_entity.id,
        ))

    return alias_entity


def _get_store(store_type: AliasStoreType) -> AliasStore:
    if store_type == AliasStoreType.PERSISTENT:
        return AliasStore()
    elif store_type == AliasStoreType.VOLATILE:
        return AliasStore(get_config().volatile_aliases_ttl)
    raise Exception(f'Unknown alias store type: {store_type}')
