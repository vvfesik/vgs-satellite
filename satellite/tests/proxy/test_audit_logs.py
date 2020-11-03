import dataclasses

from unittest.mock import Mock

import pytest

from satellite.proxy import ProxyMode
from satellite.proxy.audit_logs import (
    AuditLogRecord,
    AuditLogStore,
    emit,
    subscribe,
    UnknownFlowIdError,
)


class AuditLogTestRecord(AuditLogRecord):
    pass


def test_record(monkeypatch):
    monkeypatch.setattr(
        'satellite.proxy.audit_logs.time.time',
        Mock(return_value=123)
    )
    monkeypatch.setattr(
        'satellite.proxy.audit_logs.ctx.proxy_mode',
        ProxyMode.REVERSE,
    )

    record = AuditLogTestRecord(flow_id='flow-id')
    assert dataclasses.asdict(record) == {
        'flow_id': 'flow-id',
        'proxy_mode': ProxyMode.REVERSE,
        'timestamp': 123,
    }


def test_pubsub():
    records = []

    record = AuditLogTestRecord(flow_id='flow-id')
    subscribe(lambda record: records.append(record))
    emit(record)

    assert records == [record]


def test_store_get_ok():
    store = AuditLogStore()
    record = AuditLogTestRecord(flow_id='flow-id')
    store.save(record)
    assert store.get('flow-id') == [record]


def test_store_get_error():
    store = AuditLogStore()
    with pytest.raises(UnknownFlowIdError) as exc_info:
        store.get('flow-id')
    assert str(exc_info.value) == 'Requested audit logs for unknown flow ID: flow-id'
