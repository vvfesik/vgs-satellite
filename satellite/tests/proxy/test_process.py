from multiprocessing import Pipe, Queue

from satellite.proxy import ProxyMode, commands
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
        process.wait_proxy_started(5)
        client_channel.send(commands.StopCommand())
        process.join(5)
        assert not process.is_alive()
    finally:
        if process.is_alive():
            process.kill()
            process.join()
