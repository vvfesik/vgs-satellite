from dataclasses import dataclass
from functools import singledispatchmethod
from multiprocessing import Pipe, Queue
from multiprocessing.connection import Connection
from operator import attrgetter
from queue import Empty
from threading import Event, Thread
from typing import Callable, List, Dict, Optional

from mitmproxy.flow import Flow

from . import commands
from . import events
from . import exceptions
from . import ProxyMode
from ..flows import load_flow_from_state
from .process import ProxyProcess


class ProxyManager:
    def __init__(
        self,
        forward_proxy_port: int,
        reverse_proxy_port: int,
        event_handler: Callable,
    ):
        self._should_stop = Event()
        self._event_queue = Queue()
        self._event_queue.cancel_join_thread()
        self._event_handlers = [self._handle_event, event_handler]
        self._event_listener: ProxyEventListener = None
        self._flows: Dict[str, ProxyMode] = {}

        self._proxies: List[Dict[ProxyMode, ManagedProxyProcess]] = {}
        for mode, port in [
            (ProxyMode.FORWARD, forward_proxy_port),
            (ProxyMode.REVERSE, reverse_proxy_port),
        ]:
            manager_connection, proxy_connection = Pipe()
            self._proxies[mode] = ManagedProxyProcess(
                process=ProxyProcess(
                    mode=mode,
                    port=port,
                    event_queue=self._event_queue,
                    cmd_channel=proxy_connection,
                ),
                cmd_channel=manager_connection,
            )

    def start(self):
        for proxy in self._proxies.values():
            proxy.process.start()

        self._event_listener = ProxyEventListener(
            self._event_queue,
            self._should_stop,
            self._event_handlers,
        )
        self._event_listener.start()

    def stop(self):
        if self._should_stop.is_set():
            return

        self._should_stop.set()

        for proxy in self._proxies.values():
            if proxy.process.is_alive():
                proxy.cmd_channel.send(commands.StopCommand())

        for proxy in self._proxies.values():
            if proxy.process.is_alive():
                proxy.process.join()

        if self._event_listener and self._event_listener.is_alive():
            self._event_listener.join()

    def get_flows(self) -> List[Flow]:
        flows = []

        for proxy in self._proxies.values():
            proxy.cmd_channel.send(commands.GetFlowsCommand())

        for proxy_mode, proxy in self._proxies.items():
            flows.extend(
                self._build_flow(proxy_mode, flow_state)
                for flow_state in proxy.cmd_channel.recv()
            )

        return sorted(flows, key=attrgetter('timestamp_start'))

    def get_flow(self, flow_id: str) -> Optional[Flow]:
        proxy_mode = self._flows.get(flow_id)
        if not proxy_mode:
            raise exceptions.UnexistentFlowError()

        channel = self._proxies[proxy_mode].cmd_channel
        channel.send(commands.GetFlowCommand(flow_id))
        flow_state = channel.recv()
        if not flow_state:
            raise exceptions.UnexistentFlowError()

        return load_flow_from_state(flow_state)

    def kill_flow(self, flow_id: str) -> Optional[str]:
        proxy_mode = self._flows.get(flow_id)
        if not proxy_mode:
            raise exceptions.UnexistentFlowError()

        channel = self._proxies[proxy_mode].cmd_channel
        channel.send(commands.KillFlowCommand(flow_id))
        success = channel.recv()
        if not success:
            raise exceptions.UnkillableFlowError()

    def duplicate_flow(self, flow_id: str) -> str:
        proxy_mode = self._flows.get(flow_id)
        if not proxy_mode:
            raise exceptions.UnexistentFlowError()

        channel = self._proxies[proxy_mode].cmd_channel
        channel.send(commands.DuplicateFlowCommand(flow_id))
        flow_id = channel.recv()
        if not flow_id:
            raise exceptions.FlowDuplicationError()

        return flow_id

    def replay_flow(self, flow_id: str):
        proxy_mode = self._flows.get(flow_id)
        if not proxy_mode:
            raise exceptions.UnexistentFlowError()

        channel = self._proxies[proxy_mode].cmd_channel
        channel.send(commands.ReplayFlowCommand(flow_id))
        success = channel.recv()
        if not success:
            raise exceptions.FlowReplayError()

    def update_flow(self, flow_id: str, flow_data: dict):
        proxy_mode = self._flows.get(flow_id)
        if not proxy_mode:
            raise exceptions.UnexistentFlowError()

        channel = self._proxies[proxy_mode].cmd_channel
        channel.send(commands.UpdateFlowCommand(
            flow_id=flow_id,
            flow_data=flow_data,
        ))
        success = channel.recv()
        if not success:
            raise exceptions.FlowUpdateError()

    def _build_flow(self, proxy_mode: ProxyMode, flow_state: dict) -> Flow:
        flow = load_flow_from_state(flow_state)
        flow.mode = proxy_mode.value
        return flow

    def _handle_event(self, event):
        self._process_event(event)

    @singledispatchmethod
    def _process_event(self, event: events.ProxyEvent):
        pass

    @_process_event.register
    def _(self, event: events.FlowAddEvent):
        self._flows[event.data['id']] = event.proxy_mode

    @_process_event.register
    def _(self, event: events.FlowRemoveEvent):
        if event.data in self._flows:
            del self._flows[event.data]


class ProxyEventListener(Thread):
    def __init__(
        self,
        event_queue: Queue,
        should_stop: Event,
        event_handlers: List[Callable],
    ):
        super().__init__(name='ProxyEventListener')
        self._event_queue = event_queue
        self._should_stop = should_stop
        self._event_handlers = event_handlers

    def run(self):
        while not self._should_stop.is_set():
            try:
                event = self._event_queue.get(False, 1)
            except Empty:
                pass
            else:
                for handler in self._event_handlers:
                    handler(event=event)


@dataclass
class ManagedProxyProcess:
    process: ProxyProcess
    cmd_channel: Connection
