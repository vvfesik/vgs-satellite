from satellite import ctx as satellite_ctx
from mitmproxy import ctx as mitmproxy_ctx


def change_mode(mode):
    if not mode.startswith('regular') and mode.startswith('reverse'):
        mitmproxy_ctx.log.error(f'{mode} is not a valid proxy mode. '
                               f'Mode would stay as {mitmproxy_ctx.options.mode}')
        return
    mitmproxy_ctx.options.mode = mode
    satellite_ctx.webapp.master.restart()
