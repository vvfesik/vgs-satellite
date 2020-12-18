import pytest

from satellite.transformers import TransformerConfig
from satellite.transformers.form_data import FormDataTransformer


def transform(value: str) -> str:
    return f'transformed_{value}'


@pytest.mark.parametrize('payload,expected', [
    ('', ''),
    ('f1=v1', 'f1=transformed_v1'),
    (b'f1=v1', 'f1=transformed_v1'),
    (b'f1=v1&f1=v2', 'f1=transformed_v1&f1=transformed_v2'),
    (b'f1=v1&f2=v2', 'f1=transformed_v1&f2=v2'),
    (b'f1=', 'f1='),
    (b'f1', 'f1='),
])
def test_from_data(monkeypatch, payload, expected):
    result = FormDataTransformer(TransformerConfig(['f1'])).transform(
        payload=payload,
        operation=transform,
    )

    assert result == expected
