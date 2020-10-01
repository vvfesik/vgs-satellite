from dataclasses import dataclass


@dataclass
class ProxyCommand:
    pass


@dataclass
class StopCommand(ProxyCommand):
    expects_result: bool = False


@dataclass
class GetFlowsCommand(ProxyCommand):
    expects_result: bool = True


@dataclass
class GetFlowCommand(ProxyCommand):
    flow_id: str
    expects_result: bool = True


@dataclass
class KillFlowCommand(ProxyCommand):
    flow_id: str
    expects_result: bool = True


@dataclass
class DuplicateFlowCommand(ProxyCommand):
    flow_id: str
    expects_result: bool = True


@dataclass
class ReplayFlowCommand(ProxyCommand):
    flow_id: str
    expects_result: bool = True


@dataclass
class UpdateFlowCommand(ProxyCommand):
    flow_id: str
    flow_data: str
    expects_result: bool = True
