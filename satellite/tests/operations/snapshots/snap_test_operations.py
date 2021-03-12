# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['test_evaluate_ok[Phase.REQUEST] request'] = {
    'authority': b'httpbin.org',
    'content': b'{"foo": "bar_processed"}',
    'headers': (
        (
            b'user-agent',
            b'curl/7.64.1'
        ),
        (
            b'accept',
            b'*/*'
        ),
        (
            b'content-type',
            b'application/json'
        ),
        (
            b'content-length',
            b'24'
        ),
        (
            b'vgs-client',
            b'vgs-collect'
        ),
    ),
    'host': 'httpbin.org',
    'http_version': b'HTTP/2.0',
    'method': b'POST',
    'path': b'/post',
    'port': 443,
    'scheme': b'https',
    'timestamp_end': 1600522833.936801,
    'timestamp_start': 1600522833.932597,
    'trailers': None
}

snapshots['test_evaluate_ok[Phase.REQUEST] response'] = {
    'content': b'{\n  "args": {}, \n  "data": "{\\"foo\\": \\"bar\\"}", \n  "files": {}, \n  "form": {}, \n  "headers": {\n    "Accept": "*/*", \n    "Content-Length": "14", \n    "Content-Type": "application/json", \n    "Host": "httpbin.org", \n    "User-Agent": "curl/7.64.1", \n    "X-Amzn-Trace-Id": "Root=1-5f660a52-406ee7a82be72f6c58b5ba7c"\n  }, \n  "json": {\n    "foo": "bar"\n  }, \n  "origin": "185.205.44.203", \n  "url": "https://httpbin.org/post"\n}\n',
    'headers': (
        (
            b'date',
            b'Sat, 19 Sep 2020 13:40:34 GMT'
        ),
        (
            b'content-type',
            b'application/json'
        ),
        (
            b'content-length',
            b'426'
        ),
        (
            b'server',
            b'gunicorn/19.9.0'
        ),
        (
            b'access-control-allow-origin',
            b'*'
        ),
        (
            b'access-control-allow-credentials',
            b'true'
        )
    ),
    'http_version': b'HTTP/2.0',
    'reason': b'',
    'status_code': 200,
    'timestamp_end': 1600522834.1649642,
    'timestamp_start': 1600522834.159654,
    'trailers': None
}

snapshots['test_evaluate_ok[Phase.RESPONSE] request'] = {
    'authority': b'httpbin.org',
    'content': b'{"foo": "bar"}',
    'headers': (
        (
            b'user-agent',
            b'curl/7.64.1'
        ),
        (
            b'accept',
            b'*/*'
        ),
        (
            b'content-type',
            b'application/json'
        ),
        (
            b'content-length',
            b'14'
        ),
        (
            b'vgs-client',
            b'vgs-collect'
        ),
    ),
    'host': 'httpbin.org',
    'http_version': b'HTTP/2.0',
    'method': b'POST',
    'path': b'/post',
    'port': 443,
    'scheme': b'https',
    'timestamp_end': 1600522833.936801,
    'timestamp_start': 1600522833.932597,
    'trailers': None
}

snapshots['test_evaluate_ok[Phase.RESPONSE] response'] = {
    'content': b'{\n  "args": {}, \n  "data": "{\\"foo\\": \\"bar_processed\\"}", \n  "files": {}, \n  "form": {}, \n  "headers": {\n    "Accept": "*/*", \n    "Content-Length": "14", \n    "Content-Type": "application/json", \n    "Host": "httpbin.org", \n    "User-Agent": "curl/7.64.1", \n    "X-Amzn-Trace-Id": "Root=1-5f660a52-406ee7a82be72f6c58b5ba7c"\n  }, \n  "json": {\n    "foo": "bar_processed"\n  }, \n  "origin": "185.205.44.203", \n  "url": "https://httpbin.org/post"\n}\n',
    'headers': (
        (
            b'date',
            b'Sat, 19 Sep 2020 13:40:34 GMT'
        ),
        (
            b'content-type',
            b'application/json'
        ),
        (
            b'content-length',
            b'446'
        ),
        (
            b'server',
            b'gunicorn/19.9.0'
        ),
        (
            b'access-control-allow-origin',
            b'*'
        ),
        (
            b'access-control-allow-credentials',
            b'true'
        )
    ),
    'http_version': b'HTTP/2.0',
    'reason': b'',
    'status_code': 200,
    'timestamp_end': 1600522834.1649642,
    'timestamp_start': 1600522834.159654,
    'trailers': None
}

snapshots['test_evaluate_ok_nomock[Phase.REQUEST] request'] = {
    'authority': b'httpbin.org',
    'content': b'{"brand-new-field":"brand-new-value","foo":"bar"}',
    'headers': (
        (
            b'user-agent',
            b'curl/7.64.1'
        ),
        (
            b'accept',
            b'*/*'
        ),
        (
            b'content-type',
            b'application/json'
        ),
        (
            b'content-length',
            b'49'
        ),
        (
            b'vgs-client',
            b'vgs-collect'
        ),
        (
            b'Brand-new-header',
            b'brand-spanking-new-header-value'
        ),
    ),
    'host': 'httpbin.org',
    'http_version': b'HTTP/2.0',
    'method': b'POST',
    'path': b'/post',
    'port': 443,
    'scheme': b'https',
    'timestamp_end': 1600522833.936801,
    'timestamp_start': 1600522833.932597,
    'trailers': None
}
