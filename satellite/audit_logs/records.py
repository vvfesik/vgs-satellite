import time
from dataclasses import dataclass, field
from enum import Enum, unique
from typing import List

from ..db.models.route import Phase
from ..proxy import ProxyMode


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


@unique
class OperationStatus(Enum):
    OK = 'OK'
    ERROR = 'ERROR'


@dataclass
class AuditLogRecord:
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
    name: str


@dataclass
class VaultRequestAuditLogRecord(AuditLogRecord):
    name: str = field(default='Proxy request', init=False)
    method: str
    uri: str


@dataclass
class UpstreamResponseLogRecord(AuditLogRecord):
    name: str = field(default='Upstream response', init=False)
    status_code: int
    upstream: str


@dataclass
class VaultRecordUsageLogRecord(AuditLogRecord):
    name: str = field(default='Record usage', init=False)
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
    name: str = field(default='Route evaluation', init=False)
    route_id: str
    matched: bool
    phase: Phase


@dataclass
class VaultTrafficLogRecord(AuditLogRecord):
    name: str = field(default='Proxy traffic', init=False)
    bytes: int
    label: TrafficLabel


@dataclass
class OperationPipelineEvaluationLogRecord(AuditLogRecord):
    name: str = field(default='Operaion pipeline evaluation', init=False)
    route_id: str
    filter_id: str
    phase: Phase
    execution_time_ms: int
    execution_time_ns: int
    operations: List[str]


@dataclass
class OperationLogRecord(AuditLogRecord):
    name: str = field(default='Operation evaluation', init=False)
    route_id: str
    filter_id: str
    phase: Phase
    operation_name: str
    execution_time_ms: int
    execution_time_ns: int
    status: OperationStatus
    error_message: str
