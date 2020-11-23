import logging

from abc import ABCMeta, abstractproperty
from dataclasses import dataclass
from enum import Enum, unique
from typing import List, Tuple, Type

from mitmproxy.http import HTTPFlow
from mitmproxy.net.http.headers import Headers

from .. import audit_logs
from ..audit_logs.records import OperationLogRecord
from ..ctx import get_proxy_context
from ..db.models.route import Phase

from .utils import measure_execution_time


logger = logging.getLogger()


# Just a stub which will be removed after Starlark lib is ready.
@dataclass
class StarlarkMessage:
    headers: List[Tuple[str, str]]
    body: str


# Just a stub which will be removed after Starlark lib is ready.
def evaluate(code: str, message: StarlarkMessage) -> StarlarkMessage:
    logger.info(f'Evaluating {code} for {message}')
    return message


@unique
class OperationStatus(Enum):
    OK = 'OK'
    ERROR = 'ERROR'


# Filled in by OperationMeta
_supported_operations = {}


class OperationMeta(ABCMeta):
    def __new__(mcls, name, bases, namespace, **kwargs):
        cls = super().__new__(mcls, name, bases, namespace, **kwargs)

        if name != 'Operation':
            if cls.operation_name is None:
                raise TypeError(f'Expected operation_name defined for {name}')
            _supported_operations[cls.operation_name] = cls

        return cls


class Operation(metaclass=OperationMeta):
    operation_name: str = None

    def __init__(self, route_id: str, filter_id: str):
        self._route_id = route_id
        self._filter_id = filter_id

    @abstractproperty
    def code(self):
        """Return operation code."""

    def evaluate(self, flow: HTTPFlow, phase: Phase):
        flow_phase_obj = getattr(flow, phase.value.lower())
        input_message = StarlarkMessage(
            headers=[
                (name, value)
                for name, value in flow_phase_obj.headers.items()
            ],
            body=flow_phase_obj.content.decode(),
        )

        error = None
        output_message = None

        with measure_execution_time() as exc_time_ctx:
            try:
                output_message = evaluate(self.code, input_message)
            except Exception as exc:
                logger.exception(exc)
                error = str(exc)

        audit_logs.emit(OperationLogRecord(
            flow_id=flow.id,
            proxy_mode=get_proxy_context().mode,
            route_id=self._route_id,
            filter_id=self._filter_id,
            phase=phase,
            operation_name=self.operation_name,
            execution_time_ms=exc_time_ctx.elapsed_ms,
            execution_time_ns=exc_time_ctx.elapsed_ns,
            status=(OperationStatus.ERROR if error else OperationStatus.OK),
            error_message=error,
        ))

        if output_message:
            if input_message.body != output_message.body:
                flow_phase_obj.text = output_message.body
            if input_message.headers != output_message.headers:
                flow_phase_obj.headers = Headers(output_message.headers)


class CustomScriptOperation(Operation):
    operation_name = 'github.com/verygoodsecurity/common/script'

    def __init__(self, route_id: str, filter_id: str, code: str):
        super().__init__(route_id=route_id, filter_id=filter_id)
        self._code = code

    @property
    def code(self):
        return self._code


class UnknownOperation(Exception):
    def __init__(self, operation_name: str):
        super().__init__(f'Unknown operation name: {operation_name}')


def get_operation_class(operation_name: str) -> Type[Operation]:
    cls = _supported_operations.get(operation_name)
    if not cls:
        raise UnknownOperation(operation_name)
    return cls


def get_supported_operations():
    return list(_supported_operations)
