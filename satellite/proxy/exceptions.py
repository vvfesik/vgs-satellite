class ProxyError(Exception):
    pass


class UnexistentFlowError(ProxyError):
    def __init__(self, flow_id: str):
        super().__init__(f'Unexistent flow: {flow_id}')


class FlowUpdateError(ProxyError):
    pass


class ProxyCommandTimeoutError(ProxyError):
    pass
