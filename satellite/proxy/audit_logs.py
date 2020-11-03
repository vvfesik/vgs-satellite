import time

from abc import ABC

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Callable, List

from blinker import Signal

from . import ProxyMode
from .. import ctx


@dataclass
class AuditLogRecord(ABC):
    def __new__(cls, *args, **kwargs):
        if cls is AuditLogRecord:
            raise TypeError('Cannot instantiate abstract AuditLogRecord class.')
        return super().__new__(cls)

    flow_id: str
    timestamp: float = field(
        default_factory=lambda: time.time(),
        init=False,
    )
    proxy_mode: ProxyMode = field(
        default_factory=lambda: ctx.proxy_mode,
        init=False,
    )


@dataclass
class VaultRequestAuditLogRecord(AuditLogRecord):
    method: str
    uri: str


class UnknownFlowIdError(Exception):
    def __init__(self, flow_id: str):
        super().__init__(
            f'Requested audit logs for unknown flow ID: {flow_id}'
        )


class AuditLogStore:
    def __init__(self):
        self._store = defaultdict(list)

    def save(self, record: AuditLogRecord):
        self._store[record.flow_id].append(record)

    def get(self, flow_id: str) -> List[AuditLogRecord]:
        records = self._store.get(flow_id)
        if not records:
            raise UnknownFlowIdError(flow_id)
        return records


def emit(record: AuditLogRecord):
    _sig_audit_log.send(record=record)


def subscribe(callback: Callable):
    _sig_audit_log.connect(lambda _, record: callback(record), weak=False)


_sig_audit_log = Signal()
