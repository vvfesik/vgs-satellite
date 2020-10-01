from dataclasses import dataclass
from enum import Enum, unique
from typing import Any

from . import ProxyMode


@unique
class ProxyEventType(Enum):
    FLOW_ADD = 1
    FLOW_REMOVE = 2
    FLOW_UPDATE = 3


@dataclass
class ProxyEvent:
    data: Any
    proxy_mode: ProxyMode
    type: ProxyEventType


@dataclass
class FlowAddEvent(ProxyEvent):
    type: ProxyEventType = ProxyEventType.FLOW_ADD


@dataclass
class FlowRemoveEvent(ProxyEvent):
    type: ProxyEventType = ProxyEventType.FLOW_REMOVE


@dataclass
class FlowUpdateEvent(ProxyEvent):
    type: ProxyEventType = ProxyEventType.FLOW_UPDATE
