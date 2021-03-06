# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestAuditLogsHandlerGet::test_ok 1'] = {
    'logs': [
        {
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'method': 'POST',
            'name': 'Proxy request',
            'proxy_mode': 'reverse',
            'timestamp': 1604188800.0,
            'type': 'VaultRequestAuditLogRecord',
            'uri': 'http://httpbin.org/post'
        },
        {
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'name': 'Upstream response',
            'proxy_mode': 'reverse',
            'status_code': 200,
            'timestamp': 1604188800.0,
            'type': 'UpstreamResponseLogRecord',
            'upstream': 'httpbin.org'
        },
        {
            'action_type': 'CREATED',
            'alias_generator': 'UUID',
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'name': 'Record usage',
            'phase': 'REQUEST',
            'proxy_mode': 'reverse',
            'record_id': '75dc92d5-e9ec-45b9-a63a-5bdeb5a2fc91',
            'record_type': 'PERSISTENT',
            'route_id': '01058009-1693-4177-bcf6-fc87c57a4bfd',
            'timestamp': 1604188800.0,
            'type': 'VaultRecordUsageLogRecord'
        },
        {
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'matched': True,
            'name': 'Route evaluation',
            'phase': 'REQUEST',
            'proxy_mode': 'reverse',
            'route_id': '01058009-1693-4177-bcf6-fc87c57a4bfd',
            'timestamp': 1604188800.0,
            'type': 'RouteEvaluationLogRecord'
        },
        {
            'filter_id': 'd5e8d035-f70f-416b-8021-812d55d0c360',
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'matched': True,
            'name': 'Filter evaluation',
            'phase': 'REQUEST',
            'proxy_mode': 'reverse',
            'route_id': '01058009-1693-4177-bcf6-fc87c57a4bfd',
            'timestamp': 1604188800.0,
            'type': 'FilterEvaluationLogRecord'
        },
        {
            'bytes': 123,
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'label': 'bytesReceivedFromServer',
            'name': 'Proxy traffic',
            'proxy_mode': 'reverse',
            'timestamp': 1604188800.0,
            'type': 'VaultTrafficLogRecord'
        },
        {
            'error_message': None,
            'execution_time_ms': 1,
            'execution_time_ns': 1000000,
            'filter_id': 'd93d3034-6f78-4f00-842b-c4f9d351b4ef',
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'name': 'Operation evaluation',
            'operation_name': 'github.com/verygoodsecurity/common/script',
            'phase': 'REQUEST',
            'proxy_mode': 'reverse',
            'route_id': '01058009-1693-4177-bcf6-fc87c57a4bfd',
            'status': 'OK',
            'timestamp': 1604188800.0,
            'type': 'OperationLogRecord'
        },
        {
            'execution_time_ms': 1,
            'execution_time_ns': 1000000,
            'filter_id': 'd93d3034-6f78-4f00-842b-c4f9d351b4ef',
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'name': 'Operation pipeline evaluation',
            'operations': [
                'github.com/verygoodsecurity/common/script'
            ],
            'phase': 'REQUEST',
            'proxy_mode': 'reverse',
            'route_id': '01058009-1693-4177-bcf6-fc87c57a4bfd',
            'timestamp': 1604188800.0,
            'type': 'OperationPipelineEvaluationLogRecord'
        }
    ]
}

snapshots['TestAuditLogsHandlerGet::test_unknown_flow_id 1'] = {
    'error': {
        'message': 'Unknown flow ID: f15ccebf-6b79-4386-a4ec-0e7e3b119c03',
        'reason': 'Not found'
    }
}
