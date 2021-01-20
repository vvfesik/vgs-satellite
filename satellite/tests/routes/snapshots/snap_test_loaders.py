# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import GenericRepr, Snapshot


snapshots = Snapshot()

snapshots['test_load_from_yaml_ok 1'] = [
    (
        [
            {
                'created_at': GenericRepr('datetime.datetime(2020, 9, 23, 12, 2, 8)'),
                'destination_override_endpoint': '*',
                'host_endpoint': 'httpbin\\.org',
                'id': '61020004-b587-4844-9e1d-a0ab980a8d52',
                'port': 80,
                'protocol': 'http',
                'rule_entries_list': [
                    {
                        'classifiers': {
                        },
                        'expression_snapshot': {
                            'condition': 'AND',
                            'expression': None,
                            'rules': [
                                {
                                    'condition': None,
                                    'expression': {
                                        'field': 'PathInfo',
                                        'operator': 'matches',
                                        'type': 'string',
                                        'values': [
                                            '/post'
                                        ]
                                    },
                                    'rules': None
                                },
                                {
                                    'condition': None,
                                    'expression': {
                                        'field': 'ContentType',
                                        'operator': 'equals',
                                        'type': 'string',
                                        'values': [
                                            'application/json'
                                        ]
                                    },
                                    'rules': None
                                }
                            ]
                        },
                        'id': 'e38880f1-9a9c-4268-a801-abb233706c47',
                        'operation': GenericRepr("<Operation.ENRICH: 'ENRICH'>"),
                        'operations': None,
                        'phase': GenericRepr("<Phase.REQUEST: 'REQUEST'>"),
                        'public_token_generator': GenericRepr("<AliasGeneratorType.UUID: 'UUID'>"),
                        'targets': [
                            'body'
                        ],
                        'token_manager': GenericRepr("<AliasStoreType.PERSISTENT: 'PERSISTENT'>"),
                        'transformer': GenericRepr("<TransformerType.JSON_PATH: 'JSON_PATH'>"),
                        'transformer_config': [
                            '$.account_number'
                        ],
                        'transformer_config_map': None
                    }
                ],
                'source_endpoint': '*',
                'tags': {
                    'name': 'royal-blue-hexagon',
                    'source': 'RouteContainer'
                }
            },
            {
                'created_at': GenericRepr('datetime.datetime(2020, 10, 5, 14, 14, 16)'),
                'destination_override_endpoint': 'https://httpbin.org',
                'host_endpoint': '(.*)\\.verygoodproxy\\.com',
                'id': '6905f9d6-9fc2-4c7e-a67d-a5a730adcdbf',
                'port': 80,
                'protocol': 'http',
                'rule_entries_list': [
                    {
                        'classifiers': {
                        },
                        'expression_snapshot': {
                            'condition': 'AND',
                            'expression': None,
                            'rules': [
                                {
                                    'condition': None,
                                    'expression': {
                                        'field': 'PathInfo',
                                        'operator': 'matches',
                                        'type': 'string',
                                        'values': [
                                            '/post'
                                        ]
                                    },
                                    'rules': None
                                },
                                {
                                    'condition': None,
                                    'expression': {
                                        'field': 'ContentType',
                                        'operator': 'equals',
                                        'type': 'string',
                                        'values': [
                                            'application/json'
                                        ]
                                    },
                                    'rules': None
                                }
                            ]
                        },
                        'id': 'a88cd74f-90c3-41c9-b353-5edbfb1cd03d',
                        'operation': GenericRepr("<Operation.REDACT: 'REDACT'>"),
                        'operations': None,
                        'phase': GenericRepr("<Phase.REQUEST: 'REQUEST'>"),
                        'public_token_generator': GenericRepr("<AliasGeneratorType.UUID: 'UUID'>"),
                        'targets': [
                            'body'
                        ],
                        'token_manager': GenericRepr("<AliasStoreType.PERSISTENT: 'PERSISTENT'>"),
                        'transformer': GenericRepr("<TransformerType.JSON_PATH: 'JSON_PATH'>"),
                        'transformer_config': [
                            '$.account_number'
                        ],
                        'transformer_config_map': None
                    }
                ],
                'source_endpoint': '*',
                'tags': {
                    'name': 'echo.apps.verygood.systems-lemon-chiffon-rhombus',
                    'source': 'RouteContainer'
                }
            }
        ]
    ,),
    {
    }
]
