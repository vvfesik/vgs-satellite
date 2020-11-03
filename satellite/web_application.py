import asyncio
import logging
import signal

from functools import partial

from tornado import autoreload
from tornado.ioloop import IOLoop
from tornado.web import Application

from satellite.config import SatelliteConfig
from satellite.controller.websocket_connection import ClientConnection
from satellite.controller import flow_handlers
from satellite.controller.route_handlers import RouteHandler, RoutesHandler
from satellite.proxy.manager import ProxyManager


logger = logging.getLogger()


class WebApplication(Application):

    def __init__(self, config: SatelliteConfig = None):
        self.config = config or SatelliteConfig()
        super().__init__(debug=self.config.debug)
        self._should_exit = False
        self.add_handlers(r'^(localhost|[0-9.]+|\[[0-9a-fA-F:]+\])$', [
            (r"/", flow_handlers.Index),
            (r"/updates", ClientConnection),
            (r"/route", RoutesHandler),
            (r"/route/(?P<route_id>[0-9a-f\-]+)", RouteHandler),
            (r"/flows(?:\.json)?", flow_handlers.Flows),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)", flow_handlers.FlowHandler),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/replay", flow_handlers.ReplayFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/duplicate", flow_handlers.DuplicateFlow),
        ])
        self.proxy_manager = ProxyManager(
            forward_proxy_port=self.config.forward_proxy_port,
            reverse_proxy_port=self.config.reverse_proxy_port,
            event_handler=partial(
                self._proxy_event_handler,
                loop=asyncio.get_event_loop(),
            )
        )

    def _proxy_event_handler(self, event, loop):
        asyncio.run_coroutine_threadsafe(
            ClientConnection.process_proxy_event(event),
            loop,
        )

    def start(self):
        loop = asyncio.get_event_loop()
        for sig in [signal.SIGINT, signal.SIGTERM]:
            loop.add_signal_handler(sig, self.stop)

        if self.settings.get('autoreload'):
            autoreload.add_reload_hook(self.proxy_manager.stop)

        self.proxy_manager.start()

        self.listen(self.config.web_server_port)
        logger.info(f'Web server listening at {self.config.web_server_port} port.')
        IOLoop.current().start()

    def stop(self):
        if self._should_exit:
            return
        self._should_exit = True
        self.proxy_manager.stop()
        IOLoop.current().stop()
