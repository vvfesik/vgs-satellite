from copy import deepcopy
from datetime import datetime
from importlib import import_module
from uuid import uuid4

from factory import Factory, LazyFunction
from mitmproxy.http import HTTPFlow

from satellite.model.route import Route, RuleEntry


def load_flow(flow_name: str) -> HTTPFlow:
    state_module = import_module(f'satellite.tests.flow_fixtures.{flow_name}')
    flow = HTTPFlow(None, None)
    flow.set_state(deepcopy(state_module.state))
    return flow


class RouteFactory(Factory):
    class Meta:
        model = Route

    id = LazyFunction(lambda: str(uuid4()))
    created_at = LazyFunction(datetime.now)
    protocol = 'http'
    source_endpoint = '*'
    destination_override_endpoint = '*'
    host_endpoint = r'httpbin\.org'
    port = 443
    tags = {'source': 'vgs-satellite'}


class RuleEntryFactory(Factory):
    class Meta:
        model = RuleEntry

    id = LazyFunction(lambda: str(uuid4()))
    created_at = LazyFunction(datetime.now)
    phase = 'REQUEST'
    operation = 'REDACT'
    token_manager = 'PERSISTENT'
    public_token_generator = 'UUID'
    transformer = 'JSON_PATH'
    transformer_config = ['$.foo']
    targets = 'body'
    classifiers = {}
    expression_snapshot = LazyFunction(lambda: {
        'expression': None,
        'condition': 'AND',
        'rules': [
            {
                'condition': None,
                'rules': None,
                'expression': {
                    'field': 'PathInfo',
                    'type': 'string',
                    'operator': 'equals',
                    'values': ['/post'],
                },
            },
            {
                'condition': None,
                'rules': None,
                'expression': {
                    'field': 'ContentType',
                    'type': 'string',
                    'operator': 'equals',
                    'values': ['application/json'],
                },
            },
        ],
    })
