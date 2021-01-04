from unittest.mock import Mock

from freezegun import freeze_time

import pytest

from satellite import ctx
from satellite.aliases import AliasStoreType
from satellite.aliases import manager as alias_manager
from satellite.aliases.generators import AliasGeneratorType
from satellite.audit_logs import records
from satellite.proxy import ProxyMode
from satellite.routes import Phase


@pytest.fixture
def proxy_context():
    return ctx.ProxyContext(mode=ProxyMode.REVERSE, port=9098)


@pytest.fixture
def flow_context():
    return ctx.FlowContext(
        flow=Mock(id='313980a8-ff6c-4b13-b5a3-03909389295b'),
        phase=Phase.REQUEST,
    )


@pytest.fixture
def route_context():
    return ctx.RouteContext(
        route=Mock(id='41265f94-3ea5-46ad-b5f5-26221a41db34'),
    )


@freeze_time('2020-11-04')
def test_redact_new_token(
    monkeypatch,
    proxy_context,
    flow_context,
    route_context,
):
    monkeypatch.setattr(
        'satellite.aliases.store.get_session',
        Mock(),
    )
    monkeypatch.setattr(
        'satellite.aliases.store.AliasStore.get_by_value',
        Mock(return_value=None),
    )
    emit_audit_log = Mock()
    monkeypatch.setattr(
        'satellite.aliases.manager.audit_logs.emit',
        emit_audit_log,
    )
    monkeypatch.setattr(
        'satellite.aliases.manager.uuid.uuid4',
        Mock(return_value='ead9d833-eb9a-474c-9894-16de59682dce'),
    )

    with ctx.use_context(proxy_context), ctx.use_context(flow_context), ctx.use_context(route_context):
        alias = alias_manager.redact(
            'value',
            generator_type=AliasGeneratorType.UUID,
            store_type=AliasStoreType.PERSISTENT,
        )

    assert alias.public_alias == 'tok_sat_medNmHNXKxwuHq8AvfAhmo'
    emit_audit_log.assert_called_once_with(records.VaultRecordUsageLogRecord(
        action_type=records.ActionType.CREATED,
        alias_generator=AliasGeneratorType.UUID,
        flow_id='313980a8-ff6c-4b13-b5a3-03909389295b',
        phase=Phase.REQUEST,
        proxy_mode=ProxyMode.REVERSE,
        record_id='ead9d833-eb9a-474c-9894-16de59682dce',
        record_type=AliasStoreType.PERSISTENT,
        route_id='41265f94-3ea5-46ad-b5f5-26221a41db34',
    ))


@freeze_time('2020-11-04')
def test_redact_existing_token(
    monkeypatch,
    proxy_context,
    flow_context,
    route_context,
):
    monkeypatch.setattr(
        'satellite.aliases.store.get_session',
        Mock(),
    )
    monkeypatch.setattr(
        'satellite.aliases.store.AliasStore.get_by_value',
        Mock(return_value=Mock(
            id='ead9d833-eb9a-474c-9894-16de59682dce',
            public_alias='tok_sat_medNmHNXKxwuHq8AvfAhmo',
        )),
    )
    emit_audit_log = Mock()
    monkeypatch.setattr(
        'satellite.aliases.manager.audit_logs.emit',
        emit_audit_log,
    )
    monkeypatch.setattr(
        'satellite.aliases.manager.uuid.uuid4',
        Mock(return_value='ead9d833-eb9a-474c-9894-16de59682dce'),
    )

    with ctx.use_context(proxy_context), ctx.use_context(flow_context), ctx.use_context(route_context):
        alias = alias_manager.redact(
            'value',
            generator_type=AliasGeneratorType.UUID,
            store_type=AliasStoreType.PERSISTENT,
        )

    assert alias.public_alias == 'tok_sat_medNmHNXKxwuHq8AvfAhmo'
    emit_audit_log.assert_called_once_with(records.VaultRecordUsageLogRecord(
        action_type=records.ActionType.DE_DUPE,
        alias_generator=AliasGeneratorType.UUID,
        flow_id='313980a8-ff6c-4b13-b5a3-03909389295b',
        phase=Phase.REQUEST,
        proxy_mode=ProxyMode.REVERSE,
        record_id='ead9d833-eb9a-474c-9894-16de59682dce',
        record_type=AliasStoreType.PERSISTENT,
        route_id='41265f94-3ea5-46ad-b5f5-26221a41db34',
    ))


@freeze_time('2020-11-04')
def test_reveal(
    monkeypatch,
    proxy_context,
    flow_context,
    route_context,
):
    monkeypatch.setattr(
        'satellite.aliases.store.get_session',
        Mock(),
    )
    monkeypatch.setattr(
        'satellite.aliases.store.AliasStore.get_by_alias',
        Mock(return_value=Mock(
            alias_generator=AliasGeneratorType.UUID,
            id='ead9d833-eb9a-474c-9894-16de59682dce',
            value='value',
        )),
    )
    emit_audit_log = Mock()
    monkeypatch.setattr(
        'satellite.aliases.manager.audit_logs.emit',
        emit_audit_log,
    )
    monkeypatch.setattr(
        'satellite.aliases.manager.uuid.uuid4',
        Mock(return_value='ead9d833-eb9a-474c-9894-16de59682dce'),
    )

    with ctx.use_context(proxy_context), ctx.use_context(flow_context), ctx.use_context(route_context):
        alias = alias_manager.reveal(
            'tok_sat_medNmHNXKxwuHq8AvfAhmo',
            store_type=AliasStoreType.PERSISTENT,
        )

    assert alias.value == 'value'
    emit_audit_log.assert_called_once_with(records.VaultRecordUsageLogRecord(
        action_type=records.ActionType.RETRIEVED,
        alias_generator=AliasGeneratorType.UUID,
        flow_id='313980a8-ff6c-4b13-b5a3-03909389295b',
        phase=Phase.REQUEST,
        proxy_mode=ProxyMode.REVERSE,
        record_id='ead9d833-eb9a-474c-9894-16de59682dce',
        record_type=AliasStoreType.PERSISTENT,
        route_id='41265f94-3ea5-46ad-b5f5-26221a41db34',
    ))
