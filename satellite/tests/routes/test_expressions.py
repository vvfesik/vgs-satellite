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
