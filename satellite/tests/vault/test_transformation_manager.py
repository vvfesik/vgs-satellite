from unittest.mock import Mock

import pytest

from satellite.db.models.route import Phase
from satellite.vault.transformation_manager import transform

from ..factories import RuleEntryFactory, load_flow


@pytest.mark.parametrize('phase', [Phase.REQUEST, Phase.RESPONSE])
def test_transform_body(phase, monkeypatch, snapshot):
    monkeypatch.setattr(
        'satellite.vault.transformer.alias_manager',
        Mock(redact=lambda val, _: Mock(public_alias=f'{val}_redacted')),
    )
    flow = load_flow('http_raw')
    fltr = RuleEntryFactory()

    transform(flow, phase, fltr)

    snapshot.assert_match(flow.get_state())
