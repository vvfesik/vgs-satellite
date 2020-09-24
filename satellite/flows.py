from mitmproxy.flow import Flow


def copy_flow(flow: Flow) -> Flow:
    new_flow = flow.copy()

    for phase in ['request', 'response']:
        raw_attr = f'{phase}_raw'
        raw = getattr(flow, raw_attr, None)
        if raw:
            setattr(new_flow, raw_attr, raw)
        phase_obj = getattr(flow, phase, None)
        match_details = phase_obj and getattr(phase_obj, 'match_details', None)
        if match_details:
            setattr(
                getattr(new_flow, phase),
                'match_details',
                match_details,
            )

    return new_flow
