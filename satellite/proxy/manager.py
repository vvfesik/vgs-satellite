from dataclasses import dataclass
from multiprocessing import Pipe, Queue
from multiprocessing.connection import Connection
from queue import Empty
from threading import Event, Thread
from typing import Callable

from .process import ProxyProcess, StopCommand
from . import ProxyMode


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
        self._event_handler = event_handler
        self._event_listener: ProxyEventListener = None

        self._proxies = {}
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
            self._event_handler,
        )
        self._event_listener.start()

    def stop(self):
        if self._should_stop.is_set():
            return

        self._should_stop.set()

        for proxy in self._proxies.values():
            if proxy.process.is_alive():
                proxy.cmd_channel.send(StopCommand())

        for proxy in self._proxies.values():
            if proxy.process.is_alive():
                proxy.process.join()

        if self._event_listener and self._event_listener.is_alive():
            self._event_listener.join()


class ProxyEventListener(Thread):
    def __init__(
        self,
        event_queue: Queue,
        should_stop: Event,
        event_handler: Callable,
    ):
        super().__init__(name='ProxyEventListener')
        self._event_queue = event_queue
        self._should_stop = should_stop
        self._event_handler = event_handler

    def run(self):
        while not self._should_stop.is_set():
            try:
                event = self._event_queue.get(False, 1)
            except Empty:
                pass
            else:
                self._event_handler(event=event)


@dataclass
class ManagedProxyProcess:
    process: ProxyProcess
    cmd_channel: Connection
