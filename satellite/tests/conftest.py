import pytest
import socket


@pytest.fixture(scope='class')
def snapshot_pytest_unitest_bridge(request):
    request.cls.snapshot_should_update = request.config.option.snapshot_update


@pytest.fixture
def free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('0.0.0.0', 0))
    portnum = s.getsockname()[1]
    s.close()

    return portnum
