from dataclasses import dataclass

from . import ProxyMode


@dataclass
class ProxyEvent:
    proxy_mode: ProxyMode


@dataclass
class FlowAddEvent(ProxyEvent):
    flow_state: dict


@dataclass
class FlowRemoveEvent(ProxyEvent):
    flow_id: str


@dataclass
class FlowUpdateEvent(ProxyEvent):
    flow_state: dict
