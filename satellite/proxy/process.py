import asyncio
import logging
import signal

from functools import partial
from multiprocessing import Event as MPEvent, Queue, Process
from multiprocessing.connection import Connection
from threading import Event as ThreadingEvent, Thread
from typing import Any, Callable

import blinker

from mitmproxy.flow import Flow
from mitmproxy.addons.view import View

from satellite import ctx

from . import events
from . import exceptions
from . import ProxyMode
from ..flows import get_flow_state
from ..logging import configure_logging
from .command_processor import ProxyCommandProcessor
from .commands import ProxyCommand
from .master import ProxyMaster


logger = logging.getLogger(__file__)


class ProxyProcess(Process):
    def __init__(
        self,
        mode: ProxyMode,
        port: int,
        event_queue: Queue,
        cmd_channel: Connection,
    ):
        super().__init__(name=f'ProxyProcess-{mode.value}')

        self._mode = mode
        self._port = port
        self._event_queue = event_queue
        self._cmd_channel = cmd_channel
        self._started_event = MPEvent()

        self.master: ProxyMaster = None
        self._should_stop: ThreadingEvent = None
        self._command_listener: Thread = None
        self._command_processor: ProxyCommandProcessor = None

    @property
    def mode(self):
        return self._mode

    @property
    def port(self):
        return self._port

    def run(self):
        # We need a brand new event loop for child process since we have to
        # use fork process start method.
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        configure_logging()

        ctx.proxy_mode = self.mode

        self._should_stop = ThreadingEvent()

        self._command_listener = CommandListener(
            cmd_channel=self._cmd_channel,
            cmd_handler=partial(
                self._handle_command,
                loop=asyncio.get_event_loop(),
            ),
            should_stop=self._should_stop,
        )
        self._command_listener.start()

        self.master = ProxyMaster(self.mode, self.port)
        self.master.view.sig_view_add.connect(self._sig_flow_add)
        self.master.view.sig_view_remove.connect(self._sig_flow_remove)
        self.master.view.sig_view_update.connect(self._sig_flow_update)

        blinker.signal('sat_proxy_started').connect(self._sig_proxy_started)

        self._command_processor = ProxyCommandProcessor(self)

        signal.signal(signal.SIGINT, signal.SIG_IGN)

        self.master.run()

    def stop(self):
        if self._should_stop.is_set():
            return
        logger.info('Stopping proxy.')
        self._should_stop.set()
        self.master.shutdown()
        logger.info('Stopped proxy.')

    def wait_proxy_started(self):
        self._started_event.wait()

    def _sig_flow_add(self, view: View, flow: Flow):
        self._event_queue.put_nowait(events.FlowAddEvent(
            proxy_mode=self.mode,
            flow_state=get_flow_state(flow),
        ))

    def _sig_flow_update(self, view: View, flow: Flow):
        self._event_queue.put_nowait(events.FlowUpdateEvent(
            proxy_mode=self.mode,
            flow_state=get_flow_state(flow),
        ))

    def _sig_flow_remove(self, view: View, flow: Flow, index: int):
        self._event_queue.put_nowait(events.FlowRemoveEvent(
            proxy_mode=self.mode,
            flow_id=flow.id,
        ))

    def _sig_proxy_started(self, _):
        self._started_event.set()

    def _handle_command(
        self,
        cmd: ProxyCommand,
        loop: asyncio.AbstractEventLoop,
    ) -> Any:
        return asyncio.run_coroutine_threadsafe(
            self._handle_command_coro(cmd),
            loop,
        ).result()

    async def _handle_command_coro(self, cmd: ProxyCommand):
        return self._command_processor.process_command(cmd)


class CommandListener(Thread):
    def __init__(
        self,
        cmd_channel: Connection,
        cmd_handler: Callable,
        should_stop: ThreadingEvent,
    ):
        super().__init__(name='CommandListener', daemon=True)
        self._cmd_channel = cmd_channel
        self._cmd_handler = cmd_handler
        self._should_stop = should_stop

    def run(self):
        while not self._should_stop.is_set():
            if self._cmd_channel.poll(1):
                cmd = self._cmd_channel.recv()
                result = None
                try:
                    result = self._cmd_handler(cmd)
                except exceptions.ProxyError as exc:
                    logger.error(exc)
                    result = exc
                except Exception as exc:
                    logger.exception(exc)
                    result = exc
                self._cmd_channel.send(result)
