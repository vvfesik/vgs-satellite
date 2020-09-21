import json

from unittest.mock import Mock, patch

from mitmproxy.log import LogEntry

from ..utils import load_flow
from .base import BaseHandlerTestCase


class TestFlowsHandler(BaseHandlerTestCase):
    def test_ok(self):
        self.master.view = [load_flow('http_raw')]
        response = self.fetch(self.get_url('/flows.json'))
        self.assertEqual(response.code, 200)
        self.assertMatchSnapshot(json.loads(response.body))


class TestEventsHandler(BaseHandlerTestCase):
    @patch(
        'satellite.schemas.log_entry.LogEntrySchema.get_id',
        Mock(side_effect=[4567442480, 4567442768]),
    )
    def test_ok(self):
        self.master.events.data = [
            LogEntry('Some error', 'error'),
            LogEntry('Some warning', 'warning'),
        ]
        response = self.fetch(self.get_url('/events.json'))
        self.assertEqual(response.code, 200)
        self.assertMatchSnapshot(json.loads(response.body))
