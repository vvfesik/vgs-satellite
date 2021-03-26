from typing import List, Optional, Tuple

from marshmallow import Schema, fields, validate
from mitmproxy.flow import Flow
from mitmproxy.net.http import Message


class Address(fields.Tuple):
    def __init__(self):
        super().__init__([fields.Str, fields.Int, fields.Int, fields.Int])


class FlowSchema(Schema):
    class Conn(Schema):
        id = fields.UUID(required=True)
        address = Address()
        timestamp_start = fields.Float()
        timestamp_tls_setup = fields.Float()
        timestamp_end = fields.Float()
        sni = fields.Str()
        tls_established = fields.Bool()
        tls_version = fields.Str()
        alpn_proto_negotiated = fields.Str()

    class ClientConn(Conn):
        cipher_name = fields.Str()

    class ServerConn(Conn):
        ip_address = Address()
        source_address = Address()
        timestamp_tcp_setup = fields.Float()

    class FlowError(Schema):
        msg = fields.Str()
        timestamp = fields.Float()

    id = fields.UUID(required=True)
    intercepted = fields.Bool()
    client_conn = fields.Nested(ClientConn)
    server_conn = fields.Nested(ServerConn)
    type = fields.Str()
    modified = fields.Method(serialize='get_modified')
    marked = fields.Bool()
    mode = fields.Str()
    error = fields.Nested(FlowError)

    def get_modified(self, flow: Flow) -> bool:
        return flow.modified()


class HTTPFlowSchema(FlowSchema):
    class RequestResponse(Schema):
        class MatchDetails(Schema):
            class Filter(Schema):
                id = fields.UUID(required=True)
                operation_applied = fields.Bool(required=True)

            route_id = fields.UUID(required=True)
            filters = fields.List(fields.Nested(Filter), required=True)

        http_version = fields.Str(required=True)
        headers = fields.Method(serialize='get_headers')
        content = fields.Method(serialize='get_content')
        contentLength = fields.Method(serialize='get_content_length')
        timestamp_start = fields.Float()
        timestamp_end = fields.Float()
        match_details = fields.Nested(MatchDetails)

        def get_content(self, message: Message) -> Optional[str]:
            return message.get_text(strict=False)

        def get_content_length(self, message: Message) -> Optional[int]:
            return len(message.raw_content) if message.raw_content is not None else None

        def get_headers(self, message: Message) -> List[Tuple[str, str]]:
            return list(message.headers.items(True))

    class Request(RequestResponse):
        method = fields.Str(required=True)
        scheme = fields.Str(required=True)
        host = fields.Str(required=True)
        port = fields.Int(required=True)
        path = fields.Str(required=True)
        pretty_host = fields.Str()

    class Response(RequestResponse):
        status_code = fields.Int(required=True)
        reason = fields.Str()

    is_replay = fields.Str()
    request = fields.Nested(Request)
    request_raw = fields.Nested(Request)
    response = fields.Nested(Response)
    response_raw = fields.Nested(Response)


class FlowUpdateRequestSchema(Schema):
    class RequestResponse(Schema):
        content = fields.Str()
        headers = fields.List(
            fields.List(fields.Str(), validate=validate.Length(min=2, max=2)),
        )
        http_version = fields.Str()

    class RequestUpdate(RequestResponse):
        host = fields.Str()
        method = fields.Str()
        path = fields.Str()
        port = fields.Int()
        scheme = fields.Str()

    class ResponseUpdate(RequestResponse):
        code = fields.Int()

    request = fields.Nested(RequestUpdate)
    response = fields.Nested(ResponseUpdate)


class DuplicateFlowResponseSchema(Schema):
    id = fields.UUID(required=True, metadata={'description': 'ID of a new flow'})
