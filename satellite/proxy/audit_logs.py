import time

from abc import ABC
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum, unique
from typing import Callable, List

from blinker import Signal

from ..db.models.route import Phase
from . import ProxyMode


@unique
class RecordType(Enum):
    PERSISTENT_TOKEN = 'PERSISTENT_TOKEN'


@unique
class ActionType(Enum):
    CREATED = 'CREATED'
    RETRIEVED = 'RETRIEVED'
    DE_DUPE = 'DE_DUPE'


@unique
class TrafficLabel(Enum):
    TO_SERVER = 'bytesSentToServer'
    FROM_SERVER = 'bytesReceivedFromServer'


@dataclass
class AuditLogRecord(ABC):
    def __new__(cls, *args, **kwargs):
        if cls is AuditLogRecord:
            raise TypeError('Cannot instantiate abstract AuditLogRecord class.')
        return super().__new__(cls)

    flow_id: str
    proxy_mode: ProxyMode
    timestamp: float = field(
        default_factory=lambda: time.time(),
        init=False,
    )


@dataclass
class VaultRequestAuditLogRecord(AuditLogRecord):
    method: str
    uri: str


@dataclass
class UpstreamResponseLogRecord(AuditLogRecord):
    status_code: int
    upstream: str


@dataclass
class VaultRecordUsageLogRecord(AuditLogRecord):
    action_type: ActionType
    alias_generator: str
    phase: Phase
    record_id: str
    record_type: RecordType = field(
        default=RecordType.PERSISTENT_TOKEN,
        init=False,
    )
    route_id: str


@dataclass
class RuleChainEvaluationLogRecord(AuditLogRecord):
    route_id: str
    matched: bool
    phase: Phase


@dataclass
class VaultTrafficLogRecord(AuditLogRecord):
    bytes: int
    label: TrafficLabel


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
