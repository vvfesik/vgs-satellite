from unittest.mock import ANY, Mock

from freezegun import freeze_time

from satellite.audit_logs.records import OperationPipelineEvaluationLogRecord
from satellite.ctx import ProxyContext
from satellite.operations.pipeline import OperationPipeline, build_pipeline
from satellite.proxy import ProxyMode
from satellite.routes import Phase
from ..factories import RuleEntryFactory, load_flow


@freeze_time('2020-11-18')
def test_evaluate(monkeypatch):
    mock_emit = Mock()
    monkeypatch.setattr(
        'satellite.operations.pipeline.audit_logs.emit',
        mock_emit,
    )
    monkeypatch.setattr(
        'satellite.operations.pipeline.get_proxy_context',
        Mock(
            return_value=ProxyContext(
                mode=ProxyMode.FORWARD,
                port=9099,
            )
        ),
    )

    flow = load_flow('http_raw')
    operation = Mock(operation_name='mock-operation')
    pipeline = OperationPipeline(
        route_id='route-id',
        filter_id='filter-id',
        operations=[operation],
    )

    pipeline.evaluate(flow, Phase.REQUEST)

    operation.evaluate.assert_called_once_with(flow, Phase.REQUEST)

    mock_emit.assert_called_once_with(
        OperationPipelineEvaluationLogRecord(
            flow_id=flow.id,
            proxy_mode=ProxyMode.FORWARD,
            route_id='route-id',
            filter_id='filter-id',
            phase=Phase.REQUEST,
            execution_time_ms=ANY,
            execution_time_ns=ANY,
            operations=['mock-operation'],
        )
    )


def test_build_pipeline(monkeypatch):
    mock_operation = Mock()
    mock_operation_cls = Mock(return_value=mock_operation)
    monkeypatch.setattr(
        'satellite.operations.pipeline.get_operation_class',
        Mock(return_value=mock_operation_cls),
    )

    rule_entry = RuleEntryFactory.build(
        id='1b8f25c2-bd32-4de2-9300-a544fe8b91df',
        route_id='f6a62dec-514f-4a54-b2d8-792c568dbd8b',
        operations=[
            {
                'name': 'operation-name',
                'parameters': {'op_param_name': 'op_param_value'},
            }
        ],
    )

    pipeline = build_pipeline(rule_entry)

    assert pipeline.operations == [mock_operation]
    mock_operation_cls.assert_called_once_with(
        route_id=rule_entry.route_id,
        filter_id=rule_entry.id,
        op_param_name='op_param_value',
    )
