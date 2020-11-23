from unittest.mock import Mock

import pytest

from satellite.db.models.route import Phase
from satellite.vault.transformation_manager import transform

from ..factories import load_flow, RuleEntryFactory


@pytest.mark.parametrize('phase', [Phase.REQUEST, Phase.RESPONSE])
def test_transform_body(phase, monkeypatch, snapshot):
    transformer = Mock(transform=Mock(
        wraps=lambda payload, **kwargs: payload.replace('bar', 'bar_redacted'),
    ))
    monkeypatch.setattr(
        'satellite.vault.transformation_manager.transformer_map',
        {'JSON_PATH': transformer},
    )
    flow = load_flow('http_raw')
    rule_entry = RuleEntryFactory()

    transform(flow, phase, rule_entry)

    snapshot.assert_match(flow.get_state())
