import json

from unittest.mock import Mock

from freezegun import freeze_time

from satellite.proxy import ProxyMode
from satellite.proxy.audit_logs import (
    UnknownFlowIdError,
    VaultRequestAuditLogRecord,
)

from .base import BaseHandlerTestCase


@freeze_time('2020-11-01')
class TestAuditLogsHandlerGet(BaseHandlerTestCase):
    def test_ok(self):
        self.proxy_manager.get_audit_logs = Mock(return_value=[
            VaultRequestAuditLogRecord(
                flow_id='flow_id',
                proxy_mode=ProxyMode.REVERSE,
                method='POST',
                uri='http://httpbin.org/post',
            )
        ])
        response = self.fetch(
            self.get_url('/logs/f15ccebf-6b79-4386-a4ec-0e7e3b119c03')
        )
        self.assertEqual(response.code, 200)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_unknown_flow_id(self):
        flow_id = 'f15ccebf-6b79-4386-a4ec-0e7e3b119c03'
        self.proxy_manager.get_audit_logs = Mock(
            side_effect=UnknownFlowIdError(flow_id),
        )
        response = self.fetch(self.get_url(f'/logs/{flow_id}'))
        self.assertEqual(response.code, 404)
        self.assertMatchSnapshot(response.body)
