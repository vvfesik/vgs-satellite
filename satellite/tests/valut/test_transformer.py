from unittest.mock import Mock

import pytest

from satellite.model.route import Operation
from satellite.vault.transformer import (
    FormDataTransformer,
    TransformerError,
    XMLTransformer,
)


XML_PAYLOAD = b"""<CC>
    <Foo>PREFIX<Bar>TEXT1</Bar>TEXT2<Bar>TEXT3</Bar>TAIL</Foo>
    <Number>4111111111111111</Number>
    <Number>4444333322221111</Number>
    <CVC>123</CVC>
</CC>"""


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


@pytest.mark.parametrize('expressions', [
    [],
    ['/CC/CVC', '//Number'],
    ['/CC/Foo'],
])
def test_xml_ok(monkeypatch, snapshot, expressions):
    transform = Mock(wraps=lambda v, *args: f'transformed_{v}')
    monkeypatch.setattr('satellite.vault.transformer.transform', transform)

    result = XMLTransformer().transform(
        payload=XML_PAYLOAD,
        transformer_array=expressions,
        token_generator='UUID',
        operation=Operation.REDACT,
    )

    snapshot.assert_match(result)


def test_xml_invalid_xml():
    with pytest.raises(TransformerError) as exc_info:
        XMLTransformer().transform(
            payload=XML_PAYLOAD + b'$',
            transformer_array=[],
            token_generator='UUID',
            operation=Operation.REDACT,
        )
    assert str(exc_info.value).startswith('Invalid XML payload')


def test_xml_invalid_expr():
    with pytest.raises(TransformerError) as exc_info:
        XMLTransformer().transform(
            payload=XML_PAYLOAD,
            transformer_array=['$'],
            token_generator='UUID',
            operation=Operation.REDACT,
        )
    assert str(exc_info.value).startswith('Invalid XPath expression $')
