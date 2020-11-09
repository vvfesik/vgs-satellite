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
            'proxy_mode': 'reverse',
            'timestamp': 1604188800.0,
            'type': 'VaultRequestAuditLogRecord',
            'uri': 'http://httpbin.org/post'
        },
        {
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
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
            'phase': 'REQUEST',
            'proxy_mode': 'reverse',
            'record_id': '75dc92d5-e9ec-45b9-a63a-5bdeb5a2fc91',
            'record_type': 'PERSISTENT_TOKEN',
            'route_id': '01058009-1693-4177-bcf6-fc87c57a4bfd',
            'timestamp': 1604188800.0,
            'type': 'VaultRecordUsageLogRecord'
        },
        {
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'matched': True,
            'phase': 'REQUEST',
            'proxy_mode': 'reverse',
            'route_id': '01058009-1693-4177-bcf6-fc87c57a4bfd',
            'timestamp': 1604188800.0,
            'type': 'RuleChainEvaluationLogRecord'
        },
        {
            'bytes': 123,
            'flow_id': 'c8973f85-bb66-450b-9dd1-5f6e2c57b8bd',
            'label': 'bytesReceivedFromServer',
            'proxy_mode': 'reverse',
            'timestamp': 1604188800.0,
            'type': 'VaultTrafficLogRecord'
        }
    ]
}

snapshots['TestAuditLogsHandlerGet::test_unknown_flow_id 1'] = b'<html><title>404: Requested audit logs for unknown flow ID: f15ccebf-6b79-4386-a4ec-0e7e3b119c03</title><body>404: Requested audit logs for unknown flow ID: f15ccebf-6b79-4386-a4ec-0e7e3b119c03</body></html>'
