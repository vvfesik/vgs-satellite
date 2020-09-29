# TODO: This module is a hack. Proper ways are:
#  1. Inherit state-objects (HTTPFlow, HTTPRequest, HTTPResponse) and somehow replace original classes (hard),
#  2. Add all extra state into a one key (like 'extra_state') - much easier but probably will require changes on FE.

from copy import deepcopy
from uuid import uuid4

from mitmproxy.http import HTTPFlow, HTTPRequest, HTTPResponse


def copy_flow(flow: HTTPFlow) -> HTTPFlow:
    state = get_flow_state(flow)
    return load_flow_from_state({**state, 'id': str(uuid4)})


def get_flow_state(flow: HTTPFlow) -> dict:
    state = flow.get_state()

    for phase in ['request', 'response']:
        raw_attr = f'{phase}_raw'
        raw = getattr(flow, raw_attr, None)
        if raw:
            state[raw_attr] = raw.get_state()
        phase_obj = getattr(flow, phase, None)
        match_details = phase_obj and getattr(phase_obj, 'match_details', None)
        if match_details:
            state[phase]['match_details'] = deepcopy(match_details)

    return state


def load_flow_from_state(state: dict) -> HTTPFlow:
    extra_state = {}
    for phase in ['request', 'response']:
        raw_attr = f'{phase}_raw'
        extra_state[raw_attr] = state.pop(raw_attr, None)
        phase_state = state.get(phase)
        extra_state[f'{phase}_match_details'] = (
            phase_state and
            phase_state.pop('match_details', None)
        )

    flow = HTTPFlow.from_state(state)

    for phase, phase_cls in [
        ('request', HTTPRequest),
        ('response', HTTPResponse),
    ]:
        raw_attr = f'{phase}_raw'
        raw = extra_state.get(raw_attr)
        if raw:
            setattr(flow, raw_attr, phase_cls.from_state(raw))
        match_details = extra_state.get(f'{phase}_match_details')
        phase_obj = getattr(flow, phase, None)
        if match_details and phase_obj:
            setattr(phase_obj, 'match_details', match_details)

    return flow
