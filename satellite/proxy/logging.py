import logging

from multiprocessing import Queue

from ..ctx import get_proxy_context
from .events import LogEvent


def configure(event_queue: Queue):
    root = logging.getLogger()
    root.handlers = []
    root.addHandler(LogEventHandler(event_queue))
    root.setLevel(logging.INFO)


class LogEventHandler(logging.Handler):
    def __init__(self, event_queue: Queue):
        super().__init__()
        self._queue = event_queue

    def emit(self, record: logging.LogRecord):
        self._queue.put_nowait(LogEvent(get_proxy_context().mode, record))
