import json
from unittest.mock import Mock

from freezegun import freeze_time

from satellite.aliases import AliasStoreType
from satellite.aliases.generators import AliasGeneratorType
from satellite.audit_logs import records, store
from satellite.proxy import ProxyMode
from satellite.routes import Phase

from .base import BaseHandlerTestCase


@freeze_time('2020-11-01')
class TestAuditLogsHandlerGet(BaseHandlerTestCase):
    def test_ok(self):
        self.proxy_manager.get_audit_logs = Mock(return_value=[
            records.VaultRequestAuditLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                method='POST',
                uri='http://httpbin.org/post',
            ),
            records.UpstreamResponseLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                status_code=200,
                upstream='httpbin.org',
            ),
            records.VaultRecordUsageLogRecord(
                action_type=records.ActionType.CREATED,
                alias_generator=AliasGeneratorType.UUID,
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                phase=Phase.REQUEST,
                proxy_mode=ProxyMode.REVERSE,
                record_id='75dc92d5-e9ec-45b9-a63a-5bdeb5a2fc91',
                record_type=AliasStoreType.PERSISTENT,
                route_id='01058009-1693-4177-bcf6-fc87c57a4bfd',
            ),
            records.RouteEvaluationLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                matched=True,
                phase=Phase.REQUEST,
                proxy_mode=ProxyMode.REVERSE,
                route_id='01058009-1693-4177-bcf6-fc87c57a4bfd',
            ),
            records.FilterEvaluationLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                matched=True,
                phase=Phase.REQUEST,
                proxy_mode=ProxyMode.REVERSE,
                route_id='01058009-1693-4177-bcf6-fc87c57a4bfd',
                filter_id='d5e8d035-f70f-416b-8021-812d55d0c360',
            ),
            records.VaultTrafficLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                bytes=123,
                label=records.TrafficLabel.FROM_SERVER,
            ),
            records.OperationLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                route_id='01058009-1693-4177-bcf6-fc87c57a4bfd',
                filter_id='d93d3034-6f78-4f00-842b-c4f9d351b4ef',
                phase=Phase.REQUEST,
                operation_name='github.com/verygoodsecurity/common/script',
                execution_time_ms=1,
                execution_time_ns=1000000,
                status=records.OperationStatus.OK,
                error_message=None,
            ),
            records.OperationPipelineEvaluationLogRecord(
                flow_id='c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
                proxy_mode=ProxyMode.REVERSE,
                route_id='01058009-1693-4177-bcf6-fc87c57a4bfd',
                filter_id='d93d3034-6f78-4f00-842b-c4f9d351b4ef',
                phase=Phase.REQUEST,
                execution_time_ms=1,
                execution_time_ns=1000000,
                operations=['github.com/verygoodsecurity/common/script'],
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
            side_effect=store.UnknownFlowIdError(flow_id),
        )
        response = self.fetch(self.get_url(f'/logs/{flow_id}'))
        self.assertEqual(response.code, 404)
        self.assertMatchSnapshot(json.loads(response.body))
