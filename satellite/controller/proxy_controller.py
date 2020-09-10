from satellite import ctx as satellite_ctx
from mitmproxy import ctx as mitmproxy_ctx
from satellite.controller import BaseHandler


class SwitchMode(BaseHandler):

    def get(self, mode='regular'):
        mitmproxy_ctx.options.mode = mode
        satellite_ctx.webapp.master.restart()
