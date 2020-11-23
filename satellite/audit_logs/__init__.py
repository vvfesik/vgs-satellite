from typing import Callable

from blinker import Signal

from .records import AuditLogRecord


def emit(record: AuditLogRecord):
    _sig_audit_log.send(record=record)


def subscribe(callback: Callable):
    _sig_audit_log.connect(lambda _, record: callback(record), weak=False)


_sig_audit_log = Signal()
