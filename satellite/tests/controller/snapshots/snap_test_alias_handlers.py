# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestAliasHandler::test_get_ok 1'] = {
    'data': [
        {
            'aliases': [
                {
                    'alias': 'tok_sat_P7umYP6NSb9QtHDMgi96Tt',
                    'format': 'UUID'
                }
            ],
            'created_at': '2020-11-01T00:00:00',
            'value': '123321'
        }
    ]
}

snapshots['TestAliasHandler::test_get_unknown_alias 1'] = {
    'error': {
        'message': 'Unknown alias: tok_tas_kgq94RpcPrAMSHJWh7o7P6',
        'reason': 'Not found'
    }
}

snapshots['TestAliasesHandler::test_get_not_found 1'] = {
    'error': {
        'message': 'Missing required parameter: "q"',
        'reason': 'Invalid request'
    }
}

snapshots['TestAliasesHandler::test_get_ok 1'] = {
    'data': {
        'tok_sat_P7umYP6NSb9QtHDMgi96Tt': {
            'aliases': [
                {
                    'alias': 'tok_sat_P7umYP6NSb9QtHDMgi96Tt',
                    'format': 'UUID'
                }
            ],
            'created_at': '2020-11-01T00:00:00',
            'value': '123321'
        }
    }
}

snapshots['TestAliasesHandler::test_get_unknown_alias 1'] = {
    'data': {
        'tok_sat_P7umYP6NSb9QtHDMgi96Tt': {
            'aliases': [
                {
                    'alias': 'tok_sat_P7umYP6NSb9QtHDMgi96Tt',
                    'format': 'UUID'
                }
            ],
            'created_at': '2020-11-01T00:00:00',
            'value': '123321'
        }
    },
    'errors': [
        {
        }
    ]
}

snapshots['TestAliasesHandler::test_post_ok 1'] = {
    'data': [
        {
            'aliases': [
                {
                    'alias': 'tok_sat_P7umYP6NSb9QtHDMgi96Tt',
                    'format': 'UUID'
                }
            ],
            'created_at': '2020-11-01T00:00:00',
            'value': '123321'
        },
        {
            'aliases': [
                {
                    'alias': 'tok_sat_Rm454UAJbVTYfqXbXBjNYc',
                    'format': 'UUID'
                }
            ],
            'created_at': '2020-11-01T00:00:00',
            'value': 'abccba'
        }
    ]
}
