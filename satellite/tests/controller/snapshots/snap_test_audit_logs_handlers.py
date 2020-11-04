# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestAuditLogsHandlerGet::test_ok 1'] = {
    'logs': [
        {
            'flow_id': 'flow_id',
            'method': 'POST',
            'proxy_mode': 'reverse',
            'timestamp': 1604188800.0,
            'type': 'VaultRequestAuditLogRecord',
            'uri': 'http://httpbin.org/post'
        }
    ]
}

snapshots['TestAuditLogsHandlerGet::test_unknown_flow_id 1'] = b'<html><title>404: Requested audit logs for unknown flow ID: f15ccebf-6b79-4386-a4ec-0e7e3b119c03</title><body>404: Requested audit logs for unknown flow ID: f15ccebf-6b79-4386-a4ec-0e7e3b119c03</body></html>'
