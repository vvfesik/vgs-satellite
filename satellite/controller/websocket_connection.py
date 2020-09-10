from typing import ClassVar

from mitmproxy.tools.web.app import WebSocketEventBroadcaster


class ClientConnection(WebSocketEventBroadcaster):
    connections: ClassVar[set] = set()

    def check_origin(self, origin: str):
        return True
