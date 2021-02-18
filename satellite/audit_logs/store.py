from collections import defaultdict
from typing import List

from .records import AuditLogRecord


class UnknownFlowIdError(Exception):
    def __init__(self, flow_id: str):
        super().__init__(f'Requested audit logs for unknown flow ID: {flow_id}')


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
