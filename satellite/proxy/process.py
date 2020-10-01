import asyncio
import logging
import signal

from dataclasses import dataclass
from enum import Enum, unique
from functools import partial, singledispatchmethod
from multiprocessing import Queue, Process
from multiprocessing.connection import Connection
from threading import Event, Thread
from typing import Any, Callable, List

from mitmproxy.flow import Flow
from mitmproxy.addons.view import View

from satellite import ctx

from ..flows import get_flow_state
from ..logging import configure_logging
from . import ProxyMode
from .master import ProxyMaster


logger = logging.getLogger(__file__)


@unique
class ProxyEventType(Enum):
    FLOW_ADD = 1
    FLOW_REMOVE = 2
    FLOW_UPDATE = 3


@dataclass
class ProxyEvent:
    pass


@dataclass
class FlowAddEvent(ProxyEvent):
    flow_state: dict
    type: ProxyEventType = ProxyEventType.FLOW_ADD


@dataclass
class FlowRemoveEvent(ProxyEvent):
    flow_id: str
    type: ProxyEventType = ProxyEventType.FLOW_REMOVE


@dataclass
class FlowUpdateEvent(ProxyEvent):
    flow_state: dict
    type: ProxyEventType = ProxyEventType.FLOW_UPDATE


@unique
class ProxyCommandType(Enum):
    STOP = 1
    GET_FLOWS = 2


@dataclass
class ProxyCommand:
    pass


@dataclass
class StopCommand(ProxyCommand):
    type: ProxyCommandType = ProxyCommandType.STOP
    expects_result: bool = False


@dataclass
class GetFlowsCommand(ProxyCommand):
    type: ProxyCommandType = ProxyCommandType.GET_FLOWS
    expects_result: bool = True


class ProxyProcess(Process):
    def __init__(
        self,
        mode: ProxyMode,
        port: int,
        event_queue: Queue,
        cmd_channel: Connection,
    ):
        super().__init__(name=f'ProxyProcess[{mode.value}]')

        self._mode = mode
        self._port = port
        self._event_queue = event_queue
        self._cmd_channel = cmd_channel
        self._master: ProxyMaster = None
        self._should_stop: Event = None
        self._command_listener: Thread = None

    def run(self):
        configure_logging()

        ctx.proxy_mode = self._mode

        self._should_stop = Event()

        self._command_listener = CommandListener(
            cmd_channel=self._cmd_channel,
            cmd_handler=partial(
                self._handle_command,
                loop=asyncio.get_event_loop(),
            ),
            should_stop=self._should_stop,
        )
        self._command_listener.start()

        self._master = ProxyMaster(self._mode, self._port)
        self._master.view.sig_view_add.connect(self._sig_flow_add)
        self._master.view.sig_view_remove.connect(self._sig_flow_remove)
        self._master.view.sig_view_update.connect(self._sig_flow_update)

        signal.signal(signal.SIGINT, signal.SIG_IGN)

        logger.info(
            f'Starting proxy({self._mode.value}) at {self._port} port.',
        )

        self._master.run()

    def _sig_flow_add(self, view: View, flow: Flow):
        self._event_queue.put_nowait(FlowAddEvent(
            get_flow_state(flow),
        ))

    def _sig_flow_update(self, view: View, flow: Flow):
        self._event_queue.put_nowait(FlowUpdateEvent(
            get_flow_state(flow),
        ))

    def _sig_flow_remove(self, view: View, flow: Flow, index: int):
        self._event_queue.put_nowait(FlowRemoveEvent(flow.id))

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
        return self._process_command(cmd)

    @singledispatchmethod
    def _process_command(self, cmd) -> Any:
        raise NotImplementedError(f'Unknown command: {cmd}.')

    @_process_command.register
    def _(self, _: StopCommand):
        if self._should_stop.is_set():
            return
        logger.info(f'Stopping proxy({self._mode.value}).')
        self._should_stop.set()
        self._master.shutdown()
        logger.info(f'Stopped proxy({self._mode.value}).')

    @_process_command.register
    def _(self, _: GetFlowsCommand) -> List[dict]:
        return list(map(get_flow_state, self._master.view))


class CommandListener(Thread):
    def __init__(
        self,
        cmd_channel: Connection,
        cmd_handler: Callable,
        should_stop: Event,
    ):
        super().__init__(name='CommandListener', daemon=True)
        self._cmd_channel = cmd_channel
        self._cmd_handler = cmd_handler
        self._should_stop = should_stop

    def run(self):
        while not self._should_stop.is_set():
            if self._cmd_channel.poll(1):
                cmd = self._cmd_channel.recv()
                result = self._cmd_handler(cmd)
                if cmd.expects_result:
                    self._cmd_channel.send(result)
