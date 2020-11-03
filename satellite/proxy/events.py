from dataclasses import dataclass
from logging import LogRecord

from . import ProxyMode
from .audit_logs import AuditLogRecord


@dataclass
class ProxyEvent:
    proxy_mode: ProxyMode


@dataclass
class FlowAddEvent(ProxyEvent):
    flow_state: dict


@dataclass
class FlowRemoveEvent(ProxyEvent):
    flow_id: str


@dataclass
class FlowUpdateEvent(ProxyEvent):
    flow_state: dict


@dataclass
class LogEvent(ProxyEvent):
    record: LogRecord


@dataclass
class AuditLogEvent(ProxyEvent):
    record: AuditLogRecord
