import logging
import signal

from tornado import autoreload
from tornado.ioloop import IOLoop
from tornado.web import Application

from satellite.model.base import init_db
from satellite.controller.har_handler import HarHandler
from satellite.controller.websocket_connection import ClientConnection
from satellite.controller import flow_handlers
from satellite.controller.route_handlers import RouteHandler, RoutesHandler
from satellite.controller.proxy_handler import ProxyConfigHandler
from satellite.proxy.manager import ProxyManager
from satellite.schemas.flows import HTTPFlowSchema


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
            (r"/events(?:\.json)?", flow_handlers.EventsHandler),
            (r"/flows/resume", flow_handlers.ResumeFlows),
            (r"/flows/kill", flow_handlers.KillFlows),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)", flow_handlers.FlowHandler),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/resume", flow_handlers.ResumeFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/kill", flow_handlers.KillFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/replay", flow_handlers.ReplayFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/duplicate", flow_handlers.DuplicateFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/har", HarHandler),
            (r"/proxy", ProxyConfigHandler),
            (r"/clear", flow_handlers.ClearAll),
            (
                (
                    r'/flows/(?P<flow_id>[0-9a-f\-]+)'
                    r'/(?P<message>request|response)'
                    r'/content/(?P<content_view>[0-9a-zA-Z\-\_]+)(?:\.json)?'
                ),
                flow_handlers.FlowContentView,
            )
        ])
        # TODO: Make ports configurable
        self.proxy_manager = ProxyManager(
            forward_proxy_port=9099,
            reverse_proxy_port=9098,
        )
        self.proxy_manager.sig_flow_add.connect(self._sig_flow_add)
        self.proxy_manager.sig_flow_update.connect(self._sig_flow_update)
        self.proxy_manager.sig_flow_remove.connect(self._sig_flow_remove)

    def _sig_flow_add(self, proxy_manager: ProxyManager, flow):
        ClientConnection.broadcast(
            resource='flows',
            cmd='add',
            data=HTTPFlowSchema().dump(flow),
        )

    def _sig_flow_update(self, proxy_manager: ProxyManager, flow):
        ClientConnection.broadcast(
            resource='flows',
            cmd='update',
            data=HTTPFlowSchema().dump(flow),
        )

    def _sig_flow_remove(self, proxy_manager: ProxyManager, flow_id: str):
        ClientConnection.broadcast(
            resource='flows',
            cmd='remove',
            data=flow_id,
        )

    def start(self):
        signal.signal(signal.SIGINT, self._stop_signal_handler)
        signal.signal(signal.SIGTERM, self._stop_signal_handler)

        autoreload.add_reload_hook(self.proxy_manager.stop)

        self.proxy_manager.start()

        port = 8089  # TODO: Make port configurable
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
