from unittest.mock import Mock

from satellite.proxy import commands, ProxyMode
from satellite.proxy.manager import ProxyManager


def test_start_stop(monkeypatch):
    proxy_processes = [Mock(), Mock()]
    connections = [(Mock(), Mock()), (Mock(), Mock())]
    monkeypatch.setattr(
        'satellite.proxy.manager.ProxyProcess',
        Mock(side_effect=proxy_processes),
    )
    monkeypatch.setattr(
        'satellite.proxy.manager.Pipe',
        Mock(side_effect=connections),
    )

    manager = ProxyManager(9099, 9098, Mock())

    manager.start()
    try:
        for process in proxy_processes:
            process.start.assert_called_once()
    finally:
        manager.stop()

    for cmd_channel, _ in connections:
        cmd_channel.send.assert_called_once_with(commands.StopCommand())


def test_get_flows(monkeypatch):
    proxy_processes = [Mock(), Mock()]
    connections = [
        (Mock(recv=Mock(return_value=[{'timestamp_start': 2}])), Mock()),
        (Mock(recv=Mock(return_value=[{'timestamp_start': 1}])), Mock()),
    ]
    monkeypatch.setattr(
        'satellite.proxy.manager.ProxyProcess',
        Mock(side_effect=proxy_processes),
    )
    monkeypatch.setattr(
        'satellite.proxy.manager.Pipe',
        Mock(side_effect=connections),
    )
    monkeypatch.setattr(
        'satellite.proxy.manager.load_flow_from_state',
        lambda state: Mock(**state),
    )

    manager = ProxyManager(9099, 9098, Mock())
    flows = manager.get_flows()
    assert len(flows) == 2
    assert flows[0].timestamp_start == 1
    assert flows[1].timestamp_start == 2
    for cmd_channel, _ in connections:
        cmd_channel.send.assert_called_once_with(commands.GetFlowsCommand())


def test_get_flow(monkeypatch):
    proxy_processes = [Mock(), Mock()]
    connections = [
        (Mock(recv=Mock(return_value={'timestamp_start': 1})), Mock()),
        (Mock(), Mock()),
    ]
    monkeypatch.setattr(
        'satellite.proxy.manager.ProxyProcess',
        Mock(side_effect=proxy_processes),
    )
    monkeypatch.setattr(
        'satellite.proxy.manager.Pipe',
        Mock(side_effect=connections),
    )
    monkeypatch.setattr(
        'satellite.proxy.manager.load_flow_from_state',
        lambda state: Mock(**state),
    )

    flow_id = '23f11ab7-e071-4997-97f3-ace07bb9e56d'
    manager = ProxyManager(9099, 9098, Mock())
    manager._flows[flow_id] = ProxyMode.FORWARD

    flow = manager.get_flow(flow_id)
    assert flow.timestamp_start == 1
    assert flow.mode == ProxyMode.FORWARD.value
    connections[0][0].send.assert_called_once_with(commands.GetFlowCommand(flow_id))
