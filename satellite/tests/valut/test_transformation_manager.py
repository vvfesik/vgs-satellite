from unittest.mock import Mock

from satellite.vault.transformation_manager import transform_body

from ..factories import RuleEntryFactory


def test_transform_body(monkeypatch):
    monkeypatch.setattr(
        'satellite.vault.transformer.alias_manager',
        Mock(redact=lambda val, _: f'{val}_redacted'),
    )

    rules = RuleEntryFactory.build_batch(2)
    rules[0].transformer_config = ['$.foo']
    rules[1].transformer_config = ['$.bar']

    content, ops_application_flags = transform_body(rules, b'{"foo": "abc"}')

    assert content == '{"foo": "abc_redacted"}'
    assert ops_application_flags == [True, False]
