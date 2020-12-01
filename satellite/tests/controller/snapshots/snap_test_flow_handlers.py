# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestFlowHandler::test_get_ok 1'] = {
    'client_conn': {
        'address': [
            '::1',
            64256,
            0,
            0
        ],
        'alpn_proto_negotiated': 'h2',
        'cipher_name': 'ECDHE-RSA-AES128-GCM-SHA256',
        'id': '226dc802-2672-4846-9b54-ad104fef8e7e',
        'sni': 'httpbin.org',
        'timestamp_end': None,
        'timestamp_start': 1600522833.4427578,
        'timestamp_tls_setup': 1600522833.9239712,
        'tls_established': True,
        'tls_version': 'TLSv1.2'
    },
    'error': None,
    'id': '805b2a13-c921-48f4-85c4-dbceaea21fb4',
    'intercepted': False,
    'is_replay': None,
    'marked': False,
    'mode': 'regular',
    'modified': False,
    'request': {
        'content': '{"foo": "bar"}',
        'contentLength': 14,
        'headers': [
            [
                'user-agent',
                'curl/7.64.1'
            ],
            [
                'accept',
                '*/*'
            ],
            [
                'content-type',
                'application/json'
            ],
            [
                'content-length',
                '14'
            ]
        ],
        'host': 'httpbin.org',
        'http_version': 'HTTP/2.0',
        'method': 'POST',
        'path': '/post',
        'port': 443,
        'pretty_host': 'httpbin.org',
        'scheme': 'https',
        'timestamp_end': 1600522833.936801,
        'timestamp_start': 1600522833.932597
    },
    'response': {
        'content': '''{
  "args": {}, 
  "data": "{\\"foo\\": \\"bar\\"}", 
  "files": {}, 
  "form": {}, 
  "headers": {
    "Accept": "*/*", 
    "Content-Length": "14", 
    "Content-Type": "application/json", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.64.1", 
    "X-Amzn-Trace-Id": "Root=1-5f660a52-406ee7a82be72f6c58b5ba7c"
  }, 
  "json": {
    "foo": "bar"
  }, 
  "origin": "185.205.44.203", 
  "url": "https://httpbin.org/post"
}
''',
        'contentLength': 426,
        'headers': [
            [
                'date',
                'Sat, 19 Sep 2020 13:40:34 GMT'
            ],
            [
                'content-type',
                'application/json'
            ],
            [
                'content-length',
                '426'
            ],
            [
                'server',
                'gunicorn/19.9.0'
            ],
            [
                'access-control-allow-origin',
                '*'
            ],
            [
                'access-control-allow-credentials',
                'true'
            ]
        ],
        'http_version': 'HTTP/2.0',
        'reason': '',
        'status_code': 200,
        'timestamp_end': 1600522834.1649642,
        'timestamp_start': 1600522834.159654
    },
    'server_conn': {
        'address': [
            'httpbin.org',
            443
        ],
        'alpn_proto_negotiated': 'h2',
        'id': '2cfaddb6-49d2-42c9-a427-a97a02e49584',
        'ip_address': [
            '35.172.162.144',
            443
        ],
        'sni': 'httpbin.org',
        'source_address': [
            '192.168.88.227',
            64257
        ],
        'timestamp_end': None,
        'timestamp_start': 1600522833.459318,
        'timestamp_tcp_setup': 1600522833.594885,
        'timestamp_tls_setup': 1600522833.86449,
        'tls_established': True,
        'tls_version': 'TLSv1.2'
    },
    'type': 'http'
}

snapshots['TestFlowsHandler::test_ok 1'] = [
    {
        'client_conn': {
            'address': [
                '::1',
                64256,
                0,
                0
            ],
            'alpn_proto_negotiated': 'h2',
            'cipher_name': 'ECDHE-RSA-AES128-GCM-SHA256',
            'id': '226dc802-2672-4846-9b54-ad104fef8e7e',
            'sni': 'httpbin.org',
            'timestamp_end': None,
            'timestamp_start': 1600522833.4427578,
            'timestamp_tls_setup': 1600522833.9239712,
            'tls_established': True,
            'tls_version': 'TLSv1.2'
        },
        'error': None,
        'id': '805b2a13-c921-48f4-85c4-dbceaea21fb4',
        'intercepted': False,
        'is_replay': None,
        'marked': False,
        'mode': 'regular',
        'modified': False,
        'request': {
            'content': '{"foo": "bar"}',
            'contentLength': 14,
            'headers': [
                [
                    'user-agent',
                    'curl/7.64.1'
                ],
                [
                    'accept',
                    '*/*'
                ],
                [
                    'content-type',
                    'application/json'
                ],
                [
                    'content-length',
                    '14'
                ]
            ],
            'host': 'httpbin.org',
            'http_version': 'HTTP/2.0',
            'method': 'POST',
            'path': '/post',
            'port': 443,
            'pretty_host': 'httpbin.org',
            'scheme': 'https',
            'timestamp_end': 1600522833.936801,
            'timestamp_start': 1600522833.932597
        },
        'response': {
            'content': '''{
  "args": {}, 
  "data": "{\\"foo\\": \\"bar\\"}", 
  "files": {}, 
  "form": {}, 
  "headers": {
    "Accept": "*/*", 
    "Content-Length": "14", 
    "Content-Type": "application/json", 
    "Host": "httpbin.org", 
    "User-Agent": "curl/7.64.1", 
    "X-Amzn-Trace-Id": "Root=1-5f660a52-406ee7a82be72f6c58b5ba7c"
  }, 
  "json": {
    "foo": "bar"
  }, 
  "origin": "185.205.44.203", 
  "url": "https://httpbin.org/post"
}
''',
            'contentLength': 426,
            'headers': [
                [
                    'date',
                    'Sat, 19 Sep 2020 13:40:34 GMT'
                ],
                [
                    'content-type',
                    'application/json'
                ],
                [
                    'content-length',
                    '426'
                ],
                [
                    'server',
                    'gunicorn/19.9.0'
                ],
                [
                    'access-control-allow-origin',
                    '*'
                ],
                [
                    'access-control-allow-credentials',
                    'true'
                ]
            ],
            'http_version': 'HTTP/2.0',
            'reason': '',
            'status_code': 200,
            'timestamp_end': 1600522834.1649642,
            'timestamp_start': 1600522834.159654
        },
        'server_conn': {
            'address': [
                'httpbin.org',
                443
            ],
            'alpn_proto_negotiated': 'h2',
            'id': '2cfaddb6-49d2-42c9-a427-a97a02e49584',
            'ip_address': [
                '35.172.162.144',
                443
            ],
            'sni': 'httpbin.org',
            'source_address': [
                '192.168.88.227',
                64257
            ],
            'timestamp_end': None,
            'timestamp_start': 1600522833.459318,
            'timestamp_tcp_setup': 1600522833.594885,
            'timestamp_tls_setup': 1600522833.86449,
            'tls_established': True,
            'tls_version': 'TLSv1.2'
        },
        'type': 'http'
    }
]
