import pytest
import socket

from tempfile import NamedTemporaryFile

from satellite import db
from satellite.db.models import alias, route  # noqa


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


def pytest_configure(config):
    config.addinivalue_line('markers', 'dist: distribution tests')


def pytest_sessionstart(session):
    db.configure(_db_file.name)
    db.init()


_db_file = NamedTemporaryFile()
