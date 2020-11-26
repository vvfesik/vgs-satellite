import dataclasses
from unittest.mock import Mock

import pytest

from satellite.audit_logs import emit, subscribe
from satellite.audit_logs.records import AuditLogRecord
from satellite.audit_logs.store import AuditLogStore, UnknownFlowIdError
from satellite.proxy import ProxyMode


class AuditLogTestRecord(AuditLogRecord):
    pass


def test_record(monkeypatch):
    monkeypatch.setattr(
        'satellite.audit_logs.records.time.time',
        Mock(return_value=123)
    )

    record = AuditLogTestRecord(
        flow_id='flow-id',
        proxy_mode=ProxyMode.REVERSE,
    )
    assert dataclasses.asdict(record) == {
        'flow_id': 'flow-id',
        'proxy_mode': ProxyMode.REVERSE,
        'timestamp': 123,
    }


def test_pubsub():
    records = []

    record = AuditLogTestRecord(
        flow_id='flow-id',
        proxy_mode=ProxyMode.REVERSE,
    )
    subscribe(lambda record: records.append(record))
    emit(record)

    assert records == [record]


def test_store_get_ok():
    store = AuditLogStore()
    record = AuditLogTestRecord(
        flow_id='flow-id',
        proxy_mode=ProxyMode.REVERSE,
    )
    store.save(record)
    assert store.get('flow-id') == [record]


def test_store_get_error():
    store = AuditLogStore()
    with pytest.raises(UnknownFlowIdError) as exc_info:
        store.get('flow-id')
    assert str(exc_info.value) == 'Requested audit logs for unknown flow ID: flow-id'
