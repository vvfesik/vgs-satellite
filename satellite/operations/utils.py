from contextlib import contextmanager
from dataclasses import dataclass, field
from time import monotonic, monotonic_ns


def monotonic_ms():
    return int(monotonic() * 1000)


@dataclass
class ExecutionTimeContext:
    start_ms: int = field(
        default_factory=lambda: monotonic_ms(),
        init=False,
    )
    start_ns: int = field(
        default_factory=lambda: monotonic_ns(),
        init=False,
    )
    elapsed_ms: int = field(default=None, init=False)
    elapsed_ns: int = field(default=None, init=False)


@contextmanager
def measure_execution_time() -> ExecutionTimeContext:
    ctx = ExecutionTimeContext()
    try:
        yield ctx
    finally:
        ctx.elapsed_ms = monotonic_ms() - ctx.start_ms
        ctx.elapsed_ns = monotonic_ns() - ctx.start_ns
