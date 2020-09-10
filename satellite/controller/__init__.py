from typing import Optional

import tornado.websocket

import mitmproxy.flow
import mitmproxy.tools.web.master
from mitmproxy import http
from mitmproxy import ctx
from mitmproxy.log import LogEntry
from mitmproxy.tools.web.app import RequestHandler


class BaseHandler(RequestHandler):

    def set_default_headers(self):
        # super().set_default_headers()
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
        self.set_header('Access-Control-Allow-Headers', 'Accept, Content-Type')

    def set_json_headers(self):
        self.set_header("Accept", "application/vnd.api+json")
        self.set_header("Content-Type", "application/vnd.api+json")

    def options(self, flow_id='', route_id=''):
        self.set_status(200)
        self.finish()

def flow_to_json(flow: mitmproxy.flow.Flow) -> dict:
    """
    Remove flow message content and cert to save transmission space.

    Args:
        flow: The original flow.
    """
    f = {
        "id": flow.id,
        "intercepted": flow.intercepted,
        "client_conn": flow.client_conn.get_state(),
        "server_conn": flow.server_conn.get_state(),
        "type": flow.type,
        "modified": flow.modified(),
        "marked": flow.marked,
    }
    # .alpn_proto_negotiated is bytes, we need to decode that.
    for conn in "client_conn", "server_conn":
        if f[conn]["alpn_proto_negotiated"] is None:
            continue
        f[conn]["alpn_proto_negotiated"] = \
            f[conn]["alpn_proto_negotiated"].decode(errors="backslashreplace")
    # There are some bytes in here as well, let's skip it until we have them in the UI.
    f["client_conn"].pop("tls_extensions", None)
    if flow.error:
        f["error"] = flow.error.get_state()

    if isinstance(flow, http.HTTPFlow):
        content_length: Optional[int]
        content: Optional[str]
        if flow.request:
            content_length = None
            content = None
            if flow.request.raw_content:
                try:
                    content = flow.request.raw_content.decode("utf-8")
                    content_length = len(flow.request.raw_content)
                except UnicodeDecodeError:
                    ctx.log(f"Unsupported request content format for request: {flow.id}")
            f["request"] = {
                "method": flow.request.method,
                "scheme": flow.request.scheme,
                "host": flow.request.host,
                "port": flow.request.port,
                "path": flow.request.path,
                "http_version": flow.request.http_version,
                "headers": tuple(flow.request.headers.items(True)),
                "contentLength": content_length,
                "content": content,
                "timestamp_start": flow.request.timestamp_start,
                "timestamp_end": flow.request.timestamp_end,
                "is_replay": flow.request.is_replay,
                "pretty_host": flow.request.pretty_host,
            }
        if flow.response:
            content_length = None
            content = None
            if flow.response.raw_content:
                try:
                    content = flow.response.raw_content.decode("utf-8")
                    content_length = len(flow.response.raw_content)
                except UnicodeDecodeError:
                    ctx.log(f"Unsupported response content format for request: {flow.id}")
            f["response"] = {
                "http_version": flow.response.http_version,
                "status_code": flow.response.status_code,
                "reason": flow.response.reason,
                "headers": tuple(flow.response.headers.items(True)),
                "contentLength": content_length,
                "content": content,
                "timestamp_start": flow.response.timestamp_start,
                "timestamp_end": flow.response.timestamp_end,
                "is_replay": flow.response.is_replay,
            }
            if flow.response.data.trailers:
                f["response"]["trailers"] = tuple(flow.response.data.trailers.items(True))

    f.get("server_conn", {}).pop("cert", None)
    f.get("client_conn", {}).pop("mitmcert", None)

    return f


def logentry_to_json(e: LogEntry) -> dict:
    return {
        "id": id(e),  # we just need some kind of id.
        "message": e.msg,
        "level": e.level
    }


class APIError(tornado.web.HTTPError):
    pass
