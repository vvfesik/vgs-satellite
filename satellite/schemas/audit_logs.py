from marshmallow import Schema, fields, validate

from marshmallow_enum import EnumField

from marshmallow_oneofschema import OneOfSchema

from ..audit_logs import records
from ..db.models.route import Phase
from ..proxy import ProxyMode


class AuditLogRecordBaseSchema(Schema):
    flow_id = fields.Str(required=True)
    timestamp = fields.Float(required=True)
    proxy_mode = EnumField(ProxyMode, by_value=True, required=True)
    name = fields.Str(required=True)


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
    action_type = EnumField(records.ActionType, by_value=True, required=True)
    alias_generator = fields.Str(required=True)
    phase = EnumField(Phase, by_value=True, required=True)
    record_id = fields.Str(required=True)
    record_type = EnumField(records.RecordType, by_value=True, required=True)
    route_id = fields.Str(required=True)


class RouteEvaluationLogRecordSchema(AuditLogRecordBaseSchema):
    route_id = fields.Str(required=True)
    matched = fields.Bool(required=True)
    phase = EnumField(Phase, by_value=True, required=True)


class FilterEvaluationLogRecordSchema(AuditLogRecordBaseSchema):
    route_id = fields.Str(required=True)
    filter_id = fields.Str(required=True)
    matched = fields.Bool(required=True)
    phase = EnumField(Phase, by_value=True, required=True)


class VaultTrafficLogRecordSchema(AuditLogRecordBaseSchema):
    bytes = fields.Int(required=True)
    label = EnumField(records.TrafficLabel, by_value=True, required=True)


class OperationLogRecordSchema(AuditLogRecordBaseSchema):
    route_id = fields.Str(required=True)
    filter_id = fields.Str(required=True)
    phase = EnumField(Phase, by_value=True, required=True)
    operation_name = fields.Str(required=True)
    execution_time_ms = fields.Int(required=True)
    execution_time_ns = fields.Int(required=True)
    status = EnumField(records.OperationStatus, by_value=True, required=True)
    error_message = fields.Str()


class OperationPipelineEvaluationLogRecordSchema(AuditLogRecordBaseSchema):
    route_id = fields.Str(required=True)
    filter_id = fields.Str(required=True)
    phase = EnumField(Phase, by_value=True, required=True)
    execution_time_ms = fields.Int(required=True)
    execution_time_ns = fields.Int(required=True)
    operations = fields.List(fields.Str)


class AuditLogRecordSchema(OneOfSchema):
    type_field_remove = False
    type_schemas = {
        'FilterEvaluationLogRecord': FilterEvaluationLogRecordSchema,
        'OperationLogRecord': OperationLogRecordSchema,
        'OperationPipelineEvaluationLogRecord': OperationPipelineEvaluationLogRecordSchema,
        'RouteEvaluationLogRecord': RouteEvaluationLogRecordSchema,
        'UpstreamResponseLogRecord': UpstreamResponseLogRecordSchema,
        'VaultRecordUsageLogRecord': VaultRecordUsageLogRecordSchema,
        'VaultRequestAuditLogRecord': VaultRequestAuditLogRecordSchema,
        'VaultTrafficLogRecord': VaultTrafficLogRecordSchema,
    }


class AuditLogsResponseSchema(Schema):
    logs = fields.List(fields.Nested(AuditLogRecordSchema))
