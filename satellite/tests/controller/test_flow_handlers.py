import json

from unittest.mock import Mock

from ..factories import load_flow
from .base import BaseHandlerTestCase


class TestFlowsHandler(BaseHandlerTestCase):
    def test_ok(self):
        self.proxy_manager.get_flows = Mock(
            return_value=[load_flow('http_raw')],
        )
        response = self.fetch(self.get_url('/flows.json'))
        self.assertEqual(response.code, 200)
        self.assertMatchSnapshot(json.loads(response.body))
