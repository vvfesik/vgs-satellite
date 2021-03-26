import json
from datetime import datetime
from unittest.mock import Mock

from mitmproxy.flow import Error

from satellite.proxy import exceptions
from .base import BaseHandlerTestCase
from ..factories import load_flow


class TestFlowsHandler(BaseHandlerTestCase):
    def test_ok(self):
        self.proxy_manager.get_flows = Mock(
            return_value=[load_flow('http_raw')],
        )
        response = self.fetch(self.get_url('/flows.json'))
        self.assertEqual(response.code, 200)
        self.assertMatchSnapshot(json.loads(response.body))


class TestFlowHandler(BaseHandlerTestCase):
    def test_get_ok(self):
        flow = load_flow('http_raw')
        self.proxy_manager.get_flow = Mock(return_value=flow)
        response = self.fetch(self.get_url(f'/flows/{flow.id}'))
        self.assertEqual(response.code, 200)
        self.proxy_manager.get_flow.assert_called_once_with(flow.id)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_bad_response_encoding(self):
        flow = load_flow('http_raw')
        flow.response.set_content(
            b'\xd1\x84\xd1\x96\xd1\x88\xd0\xb3\xd0\xb2\xd1\x80\xd1\x96\xd1'
        )
        self.proxy_manager.get_flow = Mock(return_value=flow)
        response = self.fetch(self.get_url(f'/flows/{flow.id}'))
        self.assertEqual(response.code, 200)
        self.proxy_manager.get_flow.assert_called_once_with(flow.id)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_flow_with_error(self):
        flow = load_flow('http_raw')
        flow.error = Error('Test error', datetime.utcnow().timestamp())
        self.proxy_manager.get_flow = Mock(return_value=flow)

        response = self.fetch(self.get_url(f'/flows/{flow.id}'))

        self.assertEqual(response.code, 200)
        response_data = json.loads(response.body)
        self.assertEqual(
            response_data['error'],
            {
                'msg': flow.error.msg,
                'timestamp': flow.error.timestamp,
            },
        )

    def test_get_absent_flow(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        self.proxy_manager.get_flow.side_effect = exceptions.UnexistentFlowError(
            flow_id
        )
        response = self.fetch(self.get_url(f'/flows/{flow_id}'))
        self.assertEqual(response.code, 404)
        self.proxy_manager.get_flow.assert_called_once_with(flow_id)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_delete_ok(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}'),
            method='DELETE',
        )
        self.assertEqual(response.code, 204)
        self.proxy_manager.remove_flow.assert_called_once_with(flow_id)

    def test_delete_absent_flow(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        self.proxy_manager.remove_flow.side_effect = exceptions.UnexistentFlowError(
            flow_id
        )
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}'),
            method='DELETE',
        )
        self.assertEqual(response.code, 404)
        self.proxy_manager.remove_flow.assert_called_once_with(flow_id)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_update_ok(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        flow_data = {'request': {'content': 'new content'}}
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}'),
            method='PUT',
            body=json.dumps(flow_data),
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(response.code, 204, response.body)
        self.proxy_manager.update_flow.assert_called_once_with(flow_id, flow_data)

    def test_update_absent_flow(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        flow_data = {'request': {'content': 'new content'}}
        self.proxy_manager.update_flow.side_effect = exceptions.UnexistentFlowError(
            flow_id
        )
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}'),
            method='PUT',
            body=json.dumps(flow_data),
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(response.code, 404)
        self.proxy_manager.update_flow.assert_called_once_with(flow_id, flow_data)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_update_error(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        flow_data = {'request': {'content': 'new content'}}
        self.proxy_manager.update_flow.side_effect = exceptions.FlowUpdateError(flow_id)
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}'),
            method='PUT',
            body=json.dumps(flow_data),
            headers={'Content-Type': 'application/json'},
        )
        self.assertEqual(response.code, 400)
        self.proxy_manager.update_flow.assert_called_once_with(flow_id, flow_data)


class TestDuplicateFlowHandler(BaseHandlerTestCase):
    def test_ok(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        new_flow_id = '599c2bed-c79a-4ddb-a9df-92cdf999a3a7'
        self.proxy_manager.duplicate_flow.return_value = new_flow_id
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}/duplicate'),
            method='POST',
            body=b'',
        )
        self.assertEqual(response.code, 200)
        self.assertMatchSnapshot(json.loads(response.body))
        self.proxy_manager.duplicate_flow.assert_called_once_with(flow_id)

    def test_absent_error(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        self.proxy_manager.duplicate_flow.side_effect = exceptions.UnexistentFlowError(
            flow_id
        )
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}/duplicate'),
            method='POST',
            body=b'',
        )
        self.assertEqual(response.code, 404)
        self.proxy_manager.duplicate_flow.assert_called_once_with(flow_id)


class TestReplayFlowHandler(BaseHandlerTestCase):
    def test_ok(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}/replay'),
            method='POST',
            body=b'',
        )
        self.assertEqual(response.code, 204)
        self.proxy_manager.replay_flow.assert_called_once_with(flow_id)

    def test_absent_error(self):
        flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
        self.proxy_manager.replay_flow.side_effect = exceptions.UnexistentFlowError(
            flow_id
        )
        response = self.fetch(
            self.get_url(f'/flows/{flow_id}/replay'),
            method='POST',
            body=b'',
        )
        self.assertEqual(response.code, 404)
        self.proxy_manager.replay_flow.assert_called_once_with(flow_id)
