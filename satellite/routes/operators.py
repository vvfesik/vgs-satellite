import re
from abc import ABCMeta, abstractmethod
from enum import Enum, unique
from typing import Any, Callable, List, Type, Union


__all__ = ['MatchOperatorType', 'get_operator']


@unique
class MatchOperatorType(Enum):
    EQUALS = 'equals'
    DOES_NOT_EQUAL = 'does_not_equal'
    LESS_THAN = 'less_than'
    LESS_THAN_OR_EQUALS = 'less_than_or_equals'
    GREATER_THAN = 'greater_than'
    GREATER_THAN_OR_EQUAL = 'greater_than_or_equal'
    BEGINS_WITH = 'begins_with'
    DOES_NOT_BEGIN_WITH = 'does_not_begin_with'
    MATCHES = 'matches'
    ENDS_WITH = 'ends_with'
    DOES_NOT_END_WITH = 'does_not_end_with'
    IS_EMPTY = 'is_empty'
    IS_NOT_EMPTY = 'is_not_empty'


class MatchOperatorError(Exception):
    def __init__(self, op_type: MatchOperatorType, msg: str):
        super().__init__(f'Match operator[{op_type.value}] error: {msg}.')


# Filled in by MatchOperatorMeta
_operators = {}


def get_operator(
    op_type: MatchOperatorType,
    value_type: Type,
    params: List[Any],
) -> Callable[[Any], bool]:
    return _operators[op_type].build(value_type, params)


class MatchOperatorMeta(ABCMeta):
    def __new__(mcls, name, bases, namespace, **kwargs):
        cls = super().__new__(mcls, name, bases, namespace, **kwargs)
        if name not in ['MatchOperator', 'MatchOperatorWithSingleParam']:
            assert cls.supported_value_types
            assert cls.operator_type
            _operators[cls.operator_type] = cls
        return cls


class MatchOperator(metaclass=MatchOperatorMeta):
    supported_value_types = []
    operator_type = None

    def __init__(self, value_type: Type):
        if not issubclass(value_type, self.supported_value_types):
            raise MatchOperatorError(
                self.operator_type,
                (
                    'Can not build matching operator, '
                    f'unsupported value type: {value_type}'
                ),
            )
        self.value_type = value_type

    @classmethod
    def build(cls, value_type: Type, params: List[Any]) -> 'MatchOperator':
        try:
            return cls(value_type, *params)
        except MatchOperatorError:
            raise
        except Exception as exc:
            raise MatchOperatorError(cls.operator_type, str(exc)) from exc

    def __call__(self, value: Any) -> bool:
        if value is None:
            return False

        if not isinstance(value, self.value_type):
            raise MatchOperatorError(
                self.operator_type,
                (
                    'Can not evaluate matching operator, '
                    f'unsupported value type: {type(value)}'
                ),
            )

        return self._call(value)

    @abstractmethod
    def _call(self, value: Any) -> bool:
        pass


class MatchOperatorWithSingleParam(MatchOperator):
    def __init__(self, value_type: Type, param: Any):
        super().__init__(value_type)
        self.param = param


class InverseMatchOperator:
    def __call__(self, value: Any) -> bool:
        return not super().__call__(value)


class Equals(MatchOperatorWithSingleParam):
    supported_value_types = (str, int)
    operator_type = MatchOperatorType.EQUALS

    def _call(self, value: Union[str, int]) -> bool:
        return value == self.param


class DoesNotEqual(InverseMatchOperator, Equals):
    operator_type = MatchOperatorType.DOES_NOT_EQUAL


class LessThan(MatchOperatorWithSingleParam):
    supported_value_types = (int,)
    operator_type = MatchOperatorType.LESS_THAN

    def _call(self, value: int) -> bool:
        return value < self.param


class GreaterThan(MatchOperatorWithSingleParam):
    supported_value_types = (int,)
    operator_type = MatchOperatorType.GREATER_THAN

    def _call(self, value: int) -> bool:
        return value > self.param


class LessThanOrEquals(InverseMatchOperator, GreaterThan):
    operator_type = MatchOperatorType.LESS_THAN_OR_EQUALS


class GreaterThanOrEquals(InverseMatchOperator, LessThan):
    operator_type = MatchOperatorType.GREATER_THAN_OR_EQUAL


class BeginsWith(MatchOperatorWithSingleParam):
    supported_value_types = (str,)
    operator_type = MatchOperatorType.BEGINS_WITH

    def _call(self, value: str) -> bool:
        return value.startswith(self.param)


class DoesNotBeginWith(InverseMatchOperator, BeginsWith):
    operator_type = MatchOperatorType.DOES_NOT_BEGIN_WITH


class EndsWith(MatchOperatorWithSingleParam):
    supported_value_types = (str,)
    operator_type = MatchOperatorType.ENDS_WITH

    def _call(self, value: str) -> bool:
        return value.endswith(self.param)


class DoesNotEndWith(InverseMatchOperator, EndsWith):
    operator_type = MatchOperatorType.DOES_NOT_END_WITH


class IsEmpty(MatchOperator):
    supported_value_types = (str,)
    operator_type = MatchOperatorType.IS_EMPTY

    def _call(self, value: str) -> bool:
        return value == ''


class IsNotEmpty(InverseMatchOperator, IsEmpty):
    operator_type = MatchOperatorType.IS_NOT_EMPTY


class Matches(MatchOperatorWithSingleParam):
    supported_value_types = (str,)
    operator_type = MatchOperatorType.MATCHES

    def __init__(self, value_type: Type, param: str):
        super().__init__(value_type, param)
        try:
            self.pattern = re.compile(param)
        except re.error as exc:
            raise MatchOperatorError(
                self.operator_type,
                f'Invalid pattern: {param}: {exc}',
            )

    def _call(self, value: str) -> bool:
        return self.pattern.match(value) is not None
