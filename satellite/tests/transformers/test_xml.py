import pytest

from satellite.transformers import TransformerConfig, TransformerError
from satellite.transformers.xml import XMLTransformer


XML_PAYLOAD = b"""<CC>
    <Foo>PREFIX<Bar>TEXT1</Bar>TEXT2<Bar>TEXT3</Bar>TAIL</Foo>
    <Number>4111111111111111</Number>
    <Number>4444333322221111</Number>
    <CVC>123</CVC>
</CC>"""


def transform(value: str) -> str:
    return f'transformed_{value}'


@pytest.mark.parametrize('expressions', [
    [],
    ['/CC/CVC', '//Number'],
    ['/CC/Foo'],
])
def test_xml_ok(snapshot, expressions):
    result = XMLTransformer(TransformerConfig(expressions)).transform(
        payload=XML_PAYLOAD,
        operation=transform,
    )

    snapshot.assert_match(result)


def test_xml_invalid_xml():
    with pytest.raises(TransformerError) as exc_info:
        XMLTransformer(TransformerConfig([])).transform(
            payload=XML_PAYLOAD + b'$',
            operation=transform,
        )
    assert str(exc_info.value).startswith('Invalid XML payload')


def test_xml_invalid_expr():
    with pytest.raises(TransformerError) as exc_info:
        XMLTransformer(TransformerConfig(['$'])).transform(
            payload=XML_PAYLOAD,
            operation=transform,
        )
    assert str(exc_info.value).startswith('Invalid XPath expression $')
