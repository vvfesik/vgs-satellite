import tornado.escape

from satellite.controller import BaseHandler
from satellite.service.proxy_manager import change_mode


class ProxyConfigHandler(BaseHandler):

    def post(self):
        data = tornado.escape.json_decode(self.request.body)
        config = data['config']
        change_mode(config['mode'])
