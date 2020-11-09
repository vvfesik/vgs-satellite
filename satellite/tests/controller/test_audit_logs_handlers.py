import json

from unittest.mock import Mock

from freezegun import freeze_time

from satellite.db.models.route import Phase
from satellite.proxy import audit_logs, ProxyMode

from .base import BaseHandlerTestCase


@freeze_time('2020-11-01')
class TestAuditLogsHandlerGet(BaseHandlerTestCase):
    def test_ok(self):
        self.proxy_manager.get_audit_logs = Mock(return_value=[
            audit_logs.VaultRequestAuditLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                method='POST',
                uri='http://httpbin.org/post',
            ),
            audit_logs.UpstreamResponseLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                status_code=200,
                upstream='httpbin.org',
            ),
            audit_logs.VaultRecordUsageLogRecord(
                action_type=audit_logs.ActionType.CREATED,
                alias_generator='UUID',
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                phase=Phase.REQUEST,
                proxy_mode=ProxyMode.REVERSE,
                record_id='75dc92d5-e9ec-45b9-a63a-5bdeb5a2fc91',
                route_id='01058009-1693-4177-bcf6-fc87c57a4bfd',
            ),
            audit_logs.RuleChainEvaluationLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                matched=True,
                phase=Phase.REQUEST,
                proxy_mode=ProxyMode.REVERSE,
                route_id='01058009-1693-4177-bcf6-fc87c57a4bfd',
            ),
            audit_logs.VaultTrafficLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                bytes=123,
                label=audit_logs.TrafficLabel.FROM_SERVER,
            ),
        ])
        response = self.fetch(
            self.get_url('/logs/f15ccebf-6b79-4386-a4ec-0e7e3b119c03')
        )
        self.assertEqual(response.code, 200)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_unknown_flow_id(self):
        flow_id = 'f15ccebf-6b79-4386-a4ec-0e7e3b119c03'
        self.proxy_manager.get_audit_logs = Mock(
            side_effect=audit_logs.UnknownFlowIdError(flow_id),
        )
        response = self.fetch(self.get_url(f'/logs/{flow_id}'))
        self.assertEqual(response.code, 404)
        self.assertMatchSnapshot(response.body)
