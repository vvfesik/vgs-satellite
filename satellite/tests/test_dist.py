import signal
import socket
import time

from typing import List

from pathlib import Path
from subprocess import Popen

import pytest


def wait_for_ports(ports: List[int], timeout: float):
    start_ts = time.monotonic()
    while ports:
        new_ports = []
        for port in ports:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                err = sock.connect_ex(('127.0.0.1', port))
                if err:
                    new_ports.append(port)

        ports = new_ports
        if ports:
            if time.monotonic() - start_ts > timeout:
                raise TimeoutError(
                    f'Waited to long for satellite to get started: {ports}.'
                )

            time.sleep(1)


@pytest.mark.dist
def test_start_stop():
    path = Path.cwd().joinpath('dist', 'vgs-satellite-backend')
    proc = Popen(path)
    try:
        wait_for_ports([8089, 9098, 9099], 15)
        time.sleep(2)  # Give proxies some time to finalize connections
    finally:
        if proc.poll() is None:
            proc.send_signal(signal.SIGINT)
            proc.wait(5)

    assert proc.poll() == 0
