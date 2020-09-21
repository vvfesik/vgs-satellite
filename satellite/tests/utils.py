from importlib import import_module

from mitmproxy.http import HTTPFlow


def load_flow(flow_name: str) -> HTTPFlow:
    state_module = import_module(f'satellite.tests.flow_fixtures.{flow_name}')
    flow = HTTPFlow(None, None)
    flow.set_state(state_module.state)
    return flow
