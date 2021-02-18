from typing import List

from mitmproxy.http import HTTPFlow

from .operations import Operation, get_operation_class
from .utils import measure_execution_time
from .. import audit_logs
from ..audit_logs.records import OperationPipelineEvaluationLogRecord
from ..ctx import get_proxy_context
from ..db.models.route import RuleEntry
from ..routes import Phase


class OperationPipeline:
    def __init__(self, route_id: str, filter_id: str, operations: List[Operation]):
        self._route_id = route_id
        self._filter_id = filter_id
        self._operations = operations

    def evaluate(self, flow: HTTPFlow, phase: Phase):
        operation_names = []

        with measure_execution_time() as exc_time_ctx:
            for operation in self._operations:
                operation.evaluate(flow, phase)
                operation_names.append(operation.operation_name)

        audit_logs.emit(
            OperationPipelineEvaluationLogRecord(
                flow_id=flow.id,
                proxy_mode=get_proxy_context().mode,
                route_id=self._route_id,
                filter_id=self._filter_id,
                phase=phase,
                execution_time_ms=exc_time_ctx.elapsed_ms,
                execution_time_ns=exc_time_ctx.elapsed_ns,
                operations=operation_names,
            )
        )

    @property
    def operations(self):
        return self._operations


def build_pipeline(fltr: RuleEntry) -> OperationPipeline:
    operations = []
    for op_config in fltr.operations_config:
        op_cls = get_operation_class(op_config['name'])
        operations.append(
            op_cls(
                route_id=fltr.route_id,
                filter_id=fltr.id,
                **op_config['parameters'],
            )
        )

    return OperationPipeline(
        route_id=fltr.route_id,
        filter_id=fltr.id,
        operations=operations,
    )
