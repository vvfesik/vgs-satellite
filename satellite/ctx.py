from contextlib import contextmanager
from dataclasses import dataclass
from typing import Type

from mitmproxy.http import HTTPFlow

from .proxy import ProxyMode
from .db.models.route import Phase, Route


@dataclass
class Context:
    pass


@dataclass
class ProxyContext(Context):
    mode: ProxyMode
    port: int


@dataclass
class FlowContext(Context):
    flow: HTTPFlow
    phase: Phase


@dataclass
class RouteContext(Context):
    route: Route


class ContextError(Exception):
    pass


def set_context(context: Context):
    key = type(context)
    if key in _context_store:
        raise ContextError(f'Can not set context {context} - already set.')
    _context_store[key] = context


def del_context(context_cls: Type[Context]):
    if context_cls not in _context_store:
        raise ContextError(f'Deleting unset context {context_cls}.')
    del _context_store[context_cls]


def get_context(context_cls: Type[Context]) -> Context:
    return _context_store.get(context_cls)


@contextmanager
def use_context(context: Context):
    set_context(context)
    try:
        yield
    finally:
        del_context(type(context))


def get_proxy_context() -> ProxyContext:
    return get_context(ProxyContext)


def get_flow_context() -> FlowContext:
    return get_context(FlowContext)


def get_route_context() -> RouteContext:
    return get_context(RouteContext)


_context_store = {}
