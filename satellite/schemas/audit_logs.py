from marshmallow import fields, Schema, validate
from marshmallow_enum import EnumField
from marshmallow_oneofschema import OneOfSchema

from satellite.proxy import ProxyMode


class AuditLogRecordBaseSchema(Schema):
    flow_id = fields.Str(required=True)
    timestamp = fields.Float(required=True)
    proxy_mode = EnumField(ProxyMode, by_value=True, required=True)


class VaultRequestAuditLogRecordSchema(AuditLogRecordBaseSchema):
    method = fields.Str(required=True, validate=validate.OneOf([
        'CONNECT',
        'DELETE',
        'GET',
        'HEAD',
        'OPTIONS',
        'PATCH',
        'POST',
        'PUT',
        'TRACE',
    ]))
    uri = fields.URL(required=True)


class AuditLogRecordSchema(OneOfSchema):
    type_field_remove = False
    type_schemas = {
        'VaultRequestAuditLogRecord': VaultRequestAuditLogRecordSchema,
    }


class AuditLogsResponseSchema(Schema):
    logs = fields.List(fields.Nested(AuditLogRecordSchema))
