import queue

from dataclasses import dataclass
from functools import singledispatchmethod
from multiprocessing import Pipe, Queue
from multiprocessing.connection import Connection
from threading import Event, Thread

from blinker import Signal

from ..flows import load_flow_from_state
from . import process
from . import ProxyMode


class ProxyManager:
    def __init__(self, forward_proxy_port, reverse_proxy_port):
        self.sig_flow_add = Signal()
        self.sig_flow_remove = Signal()
        self.sig_flow_update = Signal()

        self._should_stop = Event()
        self._event_queue = Queue()
        self._event_queue.cancel_join_thread()

        self._event_listener: Thread = None

        self._proxies = {}
        for mode, port in [
            (ProxyMode.FORWARD, forward_proxy_port),
            (ProxyMode.REVERSE, reverse_proxy_port),
        ]:
            manager_connection, proxy_connection = Pipe()
            self._proxies[mode] = ManagedProxyProcess(
                process=process.ProxyProcess(
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

        self._event_listener = Thread(
            target=self._listen_proxy_events,
            name='EventListener',
        )
        self._event_listener.start()

    def stop(self):
        if self._should_stop.is_set():
            return

        self._should_stop.set()

        for proxy in self._proxies.values():
            if proxy.process.is_alive():
                proxy.cmd_channel.send(process.StopCommand())

        for proxy in self._proxies.values():
            if proxy.process.is_alive():
                proxy.process.join()

        if self._event_listener and self._event_listener.is_alive():
            self._event_listener.join()

    @singledispatchmethod
    def _process_event(self, event):
        raise NotImplementedError(f'Unknown event: {event}.')

    @_process_event.register
    def _process_flow_add_event(self, event: process.FlowAddEvent):
        flow = load_flow_from_state(event.flow_state)
        self.sig_flow_add.send(self, flow=flow)

    @_process_event.register
    def _process_flow_update_event(self, event: process.FlowUpdateEvent):
        flow = load_flow_from_state(event.flow_state)
        self.sig_flow_update.send(self, flow=flow)

    @_process_event.register
    def _process_flow_remove_event(self, event: process.FlowRemoveEvent):
        self.sig_flow_remove.send(self, flow_id=event.flow_id)

    def _listen_proxy_events(self):
        while not self._should_stop.is_set():
            try:
                event = self._event_queue.get(False, 1)
            except queue.Empty:
                pass
            else:
                self._process_event(event)


@dataclass
class ManagedProxyProcess:
    process: process.Process
    cmd_channel: Connection
