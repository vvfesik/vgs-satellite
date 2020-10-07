from unittest.mock import Mock

import pytest

from satellite.model.route import Operation
from satellite.vault.transformer import FormDataTransformer


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
    transform = Mock(wraps=lambda v, *args: f'transformed_{v}')
    monkeypatch.setattr('satellite.vault.transformer.transform', transform)

    result = FormDataTransformer().transform(
        payload=payload,
        transformer_array=['f1'],
        token_generator='UUID',
        operation=Operation.REDACT,
    )

    assert result == expected
