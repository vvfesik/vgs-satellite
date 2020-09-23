from marshmallow import Schema, fields
from mitmproxy.log import LogEntry


class LogEntrySchema(Schema):
    id = fields.Method(serialize='get_id')
    message = fields.Str(required=True, attribute='msg')
    level = fields.Str(required=True)

    def get_id(self, log_entry: LogEntry) -> int:
        return id(log_entry)
