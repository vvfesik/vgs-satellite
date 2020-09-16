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
from satellite.controller.flow_handlers import Flows, Events, \
    FlowContentView, ReplayFlow, DuplicateFlow, ResumeFlows, \
    KillFlows, ResumeFlow, KillFlow, ClearAll, FlowHandler, Index
from satellite.controller.route_handlers import RouteHandler, RoutesHandler
from satellite.controller.proxy_handler import ProxyConfigHandler

import satellite.ctx as satellite_ctx


class WebApplication(tornado.web.Application):

    def __init__(self):
        super().__init__(debug=True)
        init_db()
        self.master = create_proxy(ProxyMaster, cmdline.mitmweb, sys.argv[1:])
        self.add_handlers(r'^(localhost|[0-9.]+|\[[0-9a-fA-F:]+\])$', [
            (r"/", Index),
            (r"/updates", ClientConnection),
            (r"/route", RoutesHandler),
            (r"/route/(?P<route_id>[0-9a-f\-]+)", RouteHandler),
            (r"/flows(?:\.json)?", Flows),
            (r"/events(?:\.json)?", Events),
            # (r"/flows/dump", DumpFlows),
            (r"/flows/resume", ResumeFlows),
            (r"/flows/kill", KillFlows),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)", FlowHandler),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/resume", ResumeFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/kill", KillFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/replay", ReplayFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/duplicate", DuplicateFlow),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/har", HarHandler),
            (r"/proxy", ProxyConfigHandler),
            (r"/clear", ClearAll),
            (r"/flows/(?P<flow_id>[0-9a-f\-]+)/(?P<message>request|response)/content/(?P<content_view>[0-9a-zA-Z\-\_]+)(?:\.json)?", FlowContentView)
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
