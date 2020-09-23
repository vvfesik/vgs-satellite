import pytest


@pytest.fixture(scope='class')
def snapshot_pytest_unitest_bridge(request):
    request.cls.snapshot_should_update = request.config.option.snapshot_update
