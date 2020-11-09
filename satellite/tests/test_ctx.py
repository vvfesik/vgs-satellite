import pytest

from satellite import ctx
from satellite.proxy import ProxyMode


@pytest.fixture
def context():
    return ctx.ProxyContext(mode=ProxyMode.REVERSE, port=9098)


def test_get_set_context_ok(context):
    ctx.set_context(context)
    try:
        assert ctx.get_proxy_context() == context
    finally:
        ctx.del_context(ctx.ProxyContext)


def test_get_unset_context():
    with pytest.raises(ctx.ContextError):
        ctx.get_proxy_context()


def test_del_unset_context():
    with pytest.raises(ctx.ContextError):
        ctx.del_context(ctx.ProxyContext)


def test_use_context(context):
    with ctx.use_context(context):
        assert ctx.get_proxy_context() == context
    with pytest.raises(ctx.ContextError):
        ctx.del_context(ctx.ProxyContext)
