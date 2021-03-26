from satellite.routes.expressions import CompositeExpression
from ..factories import load_flow


def test_composite_exression():
    config = {
        'condition': 'AND',
        'rules': [
            {
                'expression': {
                    'field': 'ContentType',
                    'operator': 'equals',
                    'type': 'string',
                    'values': ['application/json'],
                },
            },
            {
                'condition': 'OR',
                'rules': [
                    {
                        'expression': {
                            'field': 'PathInfo',
                            'operator': 'equals',
                            'type': 'string',
                            'values': ['/post'],
                        },
                    },
                    {
                        'expression': {
                            'field': 'Method',
                            'operator': 'equals',
                            'type': 'string',
                            'values': ['POST'],
                        },
                    },
                ],
            },
        ],
    }
    expr = CompositeExpression.build(config)
    flow = load_flow('http_raw')
    assert expr.evaluate(flow)
    flow.request.path = '/get'
    assert expr.evaluate(flow)
    flow.request.method = 'GET'
    assert not expr.evaluate(flow)


def test_content_type_with_charset():
    config = {
        'condition': 'AND',
        'rules': [
            {
                'expression': {
                    'field': 'ContentType',
                    'operator': 'equals',
                    'type': 'string',
                    'values': ['application/json'],
                },
            },
        ],
    }
    expr = CompositeExpression.build(config)
    flow = load_flow('http_raw')
    flow.request.headers['Content-type'] = 'application/json; charset=UTF-8'
    assert expr.evaluate(flow)


def test_check_response_status_match():
    config = {
        'condition': 'AND',
        'rules': [
            {
                'expression': {
                    'field': 'Status',
                    'operator': 'equals',
                    'type': 'number',
                    'values': [200],
                },
            },
        ],
    }
    expr = CompositeExpression.build(config)
    flow = load_flow('http_raw')
    assert expr.evaluate(flow)


def test_check_response_status_does_not_match():
    config = {
        'condition': 'AND',
        'rules': [
            {
                'expression': {
                    'field': 'Status',
                    'operator': 'equals',
                    'type': 'number',
                    'values': [400],
                },
            },
        ],
    }
    expr = CompositeExpression.build(config)
    flow = load_flow('http_raw')
    assert not expr.evaluate(flow)
