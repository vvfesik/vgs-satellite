from abc import ABC, abstractclassmethod, abstractmethod
from enum import Enum, unique
from types import MappingProxyType
from typing import Any, List, Optional

from mitmproxy.http import HTTPFlow

from .operators import MatchOperatorError, MatchOperatorType, get_operator


@unique
class ValueType(Enum):
    STRING = 'string'
    NUMBER = 'number'


VALUE_TYPES = MappingProxyType(
    {
        ValueType.STRING: str,
        ValueType.NUMBER: int,
    }
)


@unique
class MatchCondition(Enum):
    AND = 'AND'
    OR = 'OR'


CONDITIONS = MappingProxyType(
    {
        MatchCondition.AND: all,
        MatchCondition.OR: any,
    }
)


@unique
class MatchField(Enum):
    CONTENT_TYPE = 'ContentType'
    HTTP_METHOD = 'Method'
    PATH_INFO = 'PathInfo'
    STATUS = 'Status'


def _extract_content_type(flow: HTTPFlow) -> Optional[str]:
    header = flow.request.headers.get('Content-type')
    if not header:
        return None

    fields = [field.strip() for field in header.split(';')]
    if fields and fields[0]:
        return fields[0]


def _extract_response_status(flow: HTTPFlow) -> Optional[int]:
    return flow.response.status_code if hasattr(flow, 'response') else None


FIELD_EXTRACTORS = MappingProxyType(
    {
        MatchField.CONTENT_TYPE: _extract_content_type,
        MatchField.HTTP_METHOD: lambda flow: flow.request.method,
        MatchField.PATH_INFO: lambda flow: flow.request.path,
        MatchField.STATUS: _extract_response_status,
    }
)


FIELD_TYPES = MappingProxyType(
    {
        MatchField.CONTENT_TYPE: ValueType.STRING,
        MatchField.HTTP_METHOD: ValueType.STRING,
        MatchField.PATH_INFO: ValueType.STRING,
        MatchField.STATUS: ValueType.NUMBER,
    }
)


class ExpressionError(Exception):
    pass


class BaseExpression(ABC):
    @abstractmethod
    def evaluate(self, flow: HTTPFlow) -> bool:
        pass

    @abstractclassmethod
    def build(cls, config: dict) -> 'BaseExpression':
        pass


class Expression(BaseExpression):
    def __init__(
        self,
        field: MatchField,
        operator: MatchOperatorType,
        value_type: ValueType,
        params: List[Any],
    ):
        super().__init__()
        if value_type != FIELD_TYPES[field]:
            raise ExpressionError(
                f"'{value_type.value}' type is not compatible "
                f"with '{field.value}' field"
            )

        self.operator = get_operator(operator, VALUE_TYPES[value_type], params)
        self.filed_extractor = FIELD_EXTRACTORS[field]

    def evaluate(self, flow: HTTPFlow) -> bool:
        return self.operator(value=self.filed_extractor(flow))

    @classmethod
    def build(cls, config: dict) -> 'Expression':
        try:
            field = MatchField(config['field'])
            operator = MatchOperatorType(config['operator'])
            value_type = ValueType(config['type'])
            params = config['values']
        except (ValueError, KeyError) as exc:
            raise ExpressionError(f'Unable to parse expression: {exc}') from exc

        try:
            return cls(field, operator, value_type, params)
        except MatchOperatorError as exc:
            raise ExpressionError(f'Unable to build expression: {exc}') from exc


class CompositeExpression(BaseExpression):
    def __init__(self, rules: List[BaseExpression], condition: MatchCondition):
        super().__init__()
        self.rules = rules
        self.condition = CONDITIONS[condition]

    def evaluate(self, flow: HTTPFlow) -> bool:
        return self.condition(rule.evaluate(flow) for rule in self.rules)

    @classmethod
    def build(cls, config: dict) -> 'CompositeExpression':
        rules = []

        try:
            config_rules = config['rules']
            condition = MatchCondition(config['condition'])
        except (ValueError, KeyError) as exc:
            raise ExpressionError(f'Unable to parse expression: {exc}') from exc

        for rule in config_rules:
            expr = rule.get('expression')
            if expr:
                rules.append(Expression.build(expr))
            else:
                rules.append(cls.build(rule))

        return cls(rules, condition)
