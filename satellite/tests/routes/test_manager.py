from satellite.routes import manager as route_manager

from ..factories import RouteFactory


def test_replace():
    old_route = RouteFactory()
    assert route_manager.get(old_route.id) is not None
    new_route = RouteFactory.stub()
    route_manager.replace([new_route.__dict__])
    assert route_manager.get(old_route.id) is None
    assert route_manager.get(new_route.id) is not None
