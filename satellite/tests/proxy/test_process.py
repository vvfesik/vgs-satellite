from multiprocessing import Pipe, Queue

from satellite.proxy import commands
from satellite.proxy import ProxyMode
from satellite.proxy.process import ProxyProcess


def test_start_stop(free_port):
    client_channel, proxy_channel = Pipe()
    event_queue = Queue()
    process = ProxyProcess(
        mode=ProxyMode.FORWARD,
        port=free_port,
        event_queue=event_queue,
        cmd_channel=proxy_channel,
    )
    process.start()

    try:
        assert process.wait_proxy_started(3)
        client_channel.send(commands.StopCommand())
    finally:
        process.terminate()

    process.join(2)
    assert not process.is_alive()
