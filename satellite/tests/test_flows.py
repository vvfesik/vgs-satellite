from satellite.flows import copy_flow, get_flow_state, load_flow_from_state

from .factories import load_flow


def test_copy_flow():
    flow = load_flow('http_raw')
    flow.request_raw = flow.request.copy()
    flow.request_raw.text = 'raw request'
    flow.request.match_details = {'request': 'match_details'}
    flow.response_raw = flow.response.copy()
    flow.response_raw.text = 'raw response'
    flow.response.match_details = {'response': 'match_details'}

    new_flow = copy_flow(flow)

    assert new_flow.id != flow.id
    new_flow_state = new_flow.get_state()
    del new_flow_state['id']
    flow_state = flow.get_state()
    del flow_state['id']
    assert new_flow_state == flow_state
    assert new_flow.request_raw.get_state() == flow.request_raw.get_state()
    assert new_flow.request.match_details == flow.request.match_details
    assert new_flow.response_raw.get_state() == flow.response_raw.get_state()
    assert new_flow.response.match_details == flow.response.match_details


def test_flow_state(snapshot):
    flow = load_flow('http_raw')
    flow.request_raw = flow.request.copy()
    flow.request_raw.text = 'raw request'
    flow.request.match_details = {'request': 'match_details'}
    flow.response_raw = flow.response.copy()
    flow.response_raw.text = 'raw response'
    flow.response.match_details = {'response': 'match_details'}

    state = get_flow_state(flow)

    assert type(state) is dict
    new_flow = load_flow_from_state(state)
    new_flow_state = new_flow.get_state()
    flow_state = flow.get_state()
    assert new_flow_state == flow_state
    assert new_flow.request_raw.get_state() == flow.request_raw.get_state()
    assert new_flow.request.match_details == flow.request.match_details
    assert new_flow.response_raw.get_state() == flow.response_raw.get_state()
    assert new_flow.response.match_details == flow.response.match_details
