import logging
from copy import copy

from mitmproxy.proxy.config import ProxyConfig
from mitmproxy.proxy.server import (
    ConnectionHandler,
    ProxyServer as BaseProxyServer,
)

from ..ctx import get_proxy_context
from ..proxy import ProxyMode
from ..routes import manager as route_manager


logger = logging.getLogger()


class ProxyServer(BaseProxyServer):
    def handle_client_connection(self, conn, client_address):
        config = self.config

        if get_proxy_context().mode == ProxyMode.REVERSE:
            upstream = self._get_upstream()
            if upstream:
                options = copy(self.config.options)
                options.mode = f'reverse:{upstream}'
                config = ProxyConfig(options)

        handler = ConnectionHandler(
            conn,
            client_address,
            config,
            self.channel,
        )
        handler.handle()

    def _get_upstream(self):
        routes = route_manager.get_all_by_type(is_outbound=False)
        return routes and routes[0].destination_override_endpoint
