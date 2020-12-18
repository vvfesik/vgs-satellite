from typing import List

import pytest

from satellite.transformers import TransformerConfig, TransformerError
from satellite.transformers.regex import RegexTransformer


def transform(value: str) -> str:
    return f'tok({value})'


@pytest.mark.parametrize('patterns,replacement,payload,expected', [
    ([''], '', 'A123B456C', 'A123B456C'),
    ([r'x+'], '', 'A123B456C', 'A123B456C'),
    ([r'\d+'], '', 'A123B456C', 'ABC'),
    ([r'\d+'], 'x', 'A123B456C', 'AxBxC'),
    ([r'\d+'], '%s', 'A123B456C', 'Atok(123)Btok(456)C'),
    ([r'(?<token>\d+)'], '%s', 'A123B', 'Atok(123)B'),
    ([r'(?<token>\d{3})'], '%s', 'A1234B', 'Atok(123)4B'),
    ([r'(?<prefix>A)(?<token>\d+)(?<suffix>B)'], '%s', 'A123B', 'Atok(123)B'),
    ([r'(?<suffix>A)(?<token>\d+)(?<prefix>B)'], '%s', 'A123B', 'Btok(123)A'),
    ([r'(?<token>\d+)'], '%s:${token}', 'A123B', 'Atok(123):123B'),
])
def test_from_data(patterns: List[str], replacement: str, payload: str, expected: str):
    transformer = RegexTransformer(TransformerConfig(
        array=patterns,
        map={'patterns': patterns, 'replacement': replacement},
    ))
    assert transformer.transform(payload, transform) == expected


def test_invalid_pattern():
    with pytest.raises(TransformerError) as ctx:
        RegexTransformer(TransformerConfig(
            array=['(?<'],
            map={'patterns': ['(?<'], 'replacement': ''},
        )).transform('123', transform)

    assert str(ctx.value) == 'Invalid pattern: (?<: unexpected end of pattern at position 3'


def test_unknown_groups_in_replacement():
    with pytest.raises(TransformerError) as ctx:
        RegexTransformer(TransformerConfig(
            array=[r'\d+'],
            map={'patterns': [r'\d+'], 'replacement': '${token}'},
        )).transform('123', transform)

    assert str(ctx.value) == "Invalid replacement: unknown group name 'token'"
