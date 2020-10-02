import asyncio
import logging
import signal

from functools import partial

from tornado import autoreload
from tornado.ioloop import IOLoop
from tornado.web import Application

from satellite.model.base import init_db
from satellite.controller.websocket_connection import ClientConnection
from satellite.controller import flow_handlers
from satellite.controller.route_handlers import RouteHandler, RoutesHandler
from satellite.proxy.manager import ProxyManager


logger = logging.getLogger(__file__)


class WebApplication(Application):

    def __init__(self):
        super().__init__(debug=True)
        self._should_exit = False
        init_db()
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
        # TODO: (SAT-40) Make ports configurable
        self.proxy_manager = ProxyManager(
            forward_proxy_port=9099,
            reverse_proxy_port=9098,
            event_handler=partial(
                self._proxy_event_handler,
                loop=asyncio.get_event_loop(),
            )
        )

    def _proxy_event_handler(self, event, loop):
        asyncio.run_coroutine_threadsafe(
            ClientConnection.process_proxy_event(event),
            loop,
        ).result()

    def start(self):
        signal.signal(signal.SIGINT, self._stop_signal_handler)
        signal.signal(signal.SIGTERM, self._stop_signal_handler)

        autoreload.add_reload_hook(self.proxy_manager.stop)

        self.proxy_manager.start()

        port = 8089  # TODO: (SAT-40) Make port configurable
        self.listen(port)
        logger.info(f'Web server listening at {port} port.')
        IOLoop.current().start()

    def stop(self):
        if self._should_exit:
            return
        self._should_exit = True
        self.proxy_manager.stop()
        IOLoop.current().stop()

    def _stop_signal_handler(self, signal: int, frame):
        self.stop()
