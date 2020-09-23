import sys

from tornado.platform.asyncio import AsyncIOMainLoop
import tornado.httpserver
import tornado.ioloop
import tornado.web

from mitmproxy.tools import cmdline

from satellite.model.base import init_db
from satellite.proxy import ProxyMaster
from satellite.runner import create_proxy
from satellite.controller.har_handler import HarHandler
from satellite.controller.websocket_connection import ClientConnection
from satellite.controller import flow_handlers
from satellite.controller.route_handlers import RouteHandler, RoutesHandler
from satellite.controller.proxy_handler import ProxyConfigHandler

import satellite.ctx as satellite_ctx


class WebApplication(tornado.web.Application):

    def __init__(self):
        super().__init__(debug=True)
        init_db()
        self.master = create_proxy(ProxyMaster, cmdline.mitmweb, sys.argv[1:])
        self.add_handlers(r'^(localhost|[0-9.]+|\[[0-9a-fA-F:]+\])$', [
            (r"/", flow_handlers.Index),
            (r"/updates", ClientConnection),
            (r"/route", RoutesHandler),
            (r"/route/(?P<route_id>[0-9a-f\-]+)", RouteHandler),
            (r"/flows(?:\.json)?", flow_handlers.Flows),
            (r"/events(?:\.json)?", flow_handlers.EventsHandler),
            # (r"/flows/dump", DumpFlows),
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
        self.http_server = None
        satellite_ctx.webapp = self

    def start(self):
        AsyncIOMainLoop().install()
        iol = tornado.ioloop.IOLoop.current()
        self.http_server = tornado.httpserver.HTTPServer(self)
        self.http_server.listen(self.master.options.web_port, self.master.options.web_host)
        self.master.log.info(f'Web server listening at '
                             f'http://{self.master.options.web_host}:{self.master.options.web_port}/')
        self.master.run_loop(iol.start)
