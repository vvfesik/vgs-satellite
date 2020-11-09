from marshmallow import fields, Schema, validate
from marshmallow_enum import EnumField
from marshmallow_oneofschema import OneOfSchema

from ..db.models.route import Phase
from ..proxy import audit_logs, ProxyMode


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


class UpstreamResponseLogRecordSchema(AuditLogRecordBaseSchema):
    status_code = fields.Int(required=True)
    upstream = fields.Str(required=True)


class VaultRecordUsageLogRecordSchema(AuditLogRecordBaseSchema):
    action_type = EnumField(audit_logs.ActionType, by_value=True, required=True)
    alias_generator = fields.Str(required=True)
    phase = EnumField(Phase, by_value=True, required=True)
    record_id = fields.Str(required=True)
    record_type = EnumField(audit_logs.RecordType, by_value=True, required=True)
    route_id = fields.Str(required=True)


class RuleChainEvaluationLogRecordSchema(AuditLogRecordBaseSchema):
    route_id = fields.Str(required=True)
    matched = fields.Bool(required=True)
    phase = EnumField(Phase, by_value=True, required=True)


class VaultTrafficLogRecordSchema(AuditLogRecordBaseSchema):
    bytes = fields.Int(required=True)
    label = EnumField(audit_logs.TrafficLabel, by_value=True, required=True)


class AuditLogRecordSchema(OneOfSchema):
    type_field_remove = False
    type_schemas = {
        'RuleChainEvaluationLogRecord': RuleChainEvaluationLogRecordSchema,
        'UpstreamResponseLogRecord': UpstreamResponseLogRecordSchema,
        'VaultRecordUsageLogRecord': VaultRecordUsageLogRecordSchema,
        'VaultRequestAuditLogRecord': VaultRequestAuditLogRecordSchema,
        'VaultTrafficLogRecord': VaultTrafficLogRecordSchema,
    }


class AuditLogsResponseSchema(Schema):
    logs = fields.List(fields.Nested(AuditLogRecordSchema))
