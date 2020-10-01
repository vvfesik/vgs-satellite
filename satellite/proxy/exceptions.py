class ProxyError(Exception):
    pass


class UnexistentFlowError(ProxyError):
    pass


class UnkillableFlowError(ProxyError):
    pass


class FlowDuplicationError(ProxyError):
    pass


class FlowReplayError(ProxyError):
    pass


class FlowUpdateError(ProxyError):
    pass
