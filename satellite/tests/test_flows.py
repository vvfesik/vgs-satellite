from unittest.mock import Mock

from satellite.flows import copy_flow

from .factories import load_flow


def test_copy_flow():
    flow = load_flow('http_raw')
    flow.request_raw = Mock()
    flow.request.match_details = Mock()
    flow.response_raw = Mock()
    flow.response.match_details = Mock()

    new_flow = copy_flow(flow)

    assert new_flow.id != flow.id
    new_flow_state = new_flow.get_state()
    del new_flow_state['id']
    flow_state = flow.get_state()
    del flow_state['id']
    assert new_flow_state == flow_state
    assert new_flow.request_raw == flow.request_raw
    assert new_flow.request.match_details == flow.request.match_details
    assert new_flow.response_raw == flow.response_raw
    assert new_flow.response.match_details == flow.response.match_details
