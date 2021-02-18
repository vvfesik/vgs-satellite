import pytest

from satellite.routes.operators import MatchOperatorType, get_operator


def _test_operator(op_type, params, value, result):
    op = get_operator(op_type, type(value), params)
    assert op(value) is result


@pytest.mark.parametrize(
    'params,value,result',
    [
        (['a'], 'a', True),
        (['a'], 'b', False),
        ([1], 1, True),
        ([1], 2, False),
    ],
)
def test_equals(params, value, result):
    _test_operator(MatchOperatorType.EQUALS, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        (['a'], 'a', False),
        (['a'], 'b', True),
        ([1], 1, False),
        ([1], 2, True),
    ],
)
def test_does_not_equal(params, value, result):
    _test_operator(MatchOperatorType.DOES_NOT_EQUAL, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        ([2], 1, True),
        ([2], 2, False),
        ([2], 3, False),
    ],
)
def test_less_than(params, value, result):
    _test_operator(MatchOperatorType.LESS_THAN, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        ([2], 1, True),
        ([2], 2, True),
        ([2], 3, False),
    ],
)
def test_less_than_or_equals(params, value, result):
    _test_operator(MatchOperatorType.LESS_THAN_OR_EQUALS, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        ([2], 1, False),
        ([2], 2, False),
        ([2], 3, True),
    ],
)
def test_greater_than(params, value, result):
    _test_operator(MatchOperatorType.GREATER_THAN, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        ([2], 1, False),
        ([2], 2, True),
        ([2], 3, True),
    ],
)
def test_greater_than_or_equal(params, value, result):
    _test_operator(MatchOperatorType.GREATER_THAN_OR_EQUAL, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        (['a'], 'abc', True),
        (['a'], 'cba', False),
    ],
)
def test_begins_with(params, value, result):
    _test_operator(MatchOperatorType.BEGINS_WITH, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        (['a'], 'abc', False),
        (['a'], 'cba', True),
    ],
)
def test_does_not_begin_with(params, value, result):
    _test_operator(MatchOperatorType.DOES_NOT_BEGIN_WITH, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        (['a'], 'abc', False),
        (['a'], 'cba', True),
    ],
)
def test_ends_with(params, value, result):
    _test_operator(MatchOperatorType.ENDS_WITH, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        (['a'], 'abc', True),
        (['a'], 'cba', False),
    ],
)
def test_does_not_end_with(params, value, result):
    _test_operator(MatchOperatorType.DOES_NOT_END_WITH, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        ([], '', True),
        ([], 'a', False),
    ],
)
def test_is_empty(params, value, result):
    _test_operator(MatchOperatorType.IS_EMPTY, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        ([], '', False),
        ([], 'a', True),
    ],
)
def test_is_not_empty(params, value, result):
    _test_operator(MatchOperatorType.IS_NOT_EMPTY, params, value, result)


@pytest.mark.parametrize(
    'params,value,result',
    [
        ([r'/post'], '/post', True),
        ([r'/post'], '/get', False),
        ([r'/\w+'], '/post', True),
    ],
)
def test_matches(params, value, result):
    _test_operator(MatchOperatorType.MATCHES, params, value, result)
