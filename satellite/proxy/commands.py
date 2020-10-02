from dataclasses import dataclass


@dataclass
class ProxyCommand:
    pass


@dataclass
class StopCommand(ProxyCommand):
    pass


@dataclass
class GetFlowsCommand(ProxyCommand):
    pass


@dataclass
class GetFlowCommand(ProxyCommand):
    flow_id: str


@dataclass
class KillFlowCommand(ProxyCommand):
    flow_id: str


@dataclass
class DuplicateFlowCommand(ProxyCommand):
    flow_id: str


@dataclass
class ReplayFlowCommand(ProxyCommand):
    flow_id: str


@dataclass
class UpdateFlowCommand(ProxyCommand):
    flow_id: str
    flow_data: str
