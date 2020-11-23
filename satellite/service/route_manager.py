
import logging

from typing import List

from ..db import get_session, update_model
from ..db.models.route import Route, RuleEntry, RouteType
from ..operations.pipeline import build_pipeline


logger = logging.getLogger()


class EntityNotFound(Exception):
    pass


class InvalidRouteConfiguration(Exception):
    pass


def get_all() -> List[Route]:
    return get_session().query(Route).all()


def get_all_by_type(route_type: RouteType) -> List[Route]:
    route_all = get_all()
    if route_type == RouteType.OUTBOUND:
        return [route for route in route_all if route.is_outbound()]
    else:
        return [route for route in route_all if not route.is_outbound()]


def get(route_id: str) -> Route:
    return get_session().query(Route).filter(Route.id == route_id).first()


def create(route_data: dict) -> Route:
    route = Route(**{
        **route_data,
        'rule_entries_list': [
            RuleEntry(**rule_entry)
            for rule_entry in route_data.get('rule_entries_list', [])
        ]
    })

    check_route(route)

    session = get_session()
    try:
        session.add(route)
        session.commit()
    except Exception:
        session.rollback()
        raise

    return route


def update(route_id: str, route_data: dict) -> Route:
    route = get(route_id)
    if not route:
        # Have to allow route creation via update since currently FE uses the
        # update endpoint for routes import.
        return create({**route_data, 'id': route_id})

    update_model(route, route_data)

    rule_entries = {entry.id: entry for entry in route.rule_entries_list}
    for rule_data in route_data.get('rule_entries_list', []):
        rule_id = rule_data.get('id')
        rule = rule_id is not None and rule_entries.get(rule_id)
        if rule:
            update_model(rule, rule_data, ['id'])
        else:
            route.rule_entries_list.append(RuleEntry(**rule_data))

    check_route(route)

    session = get_session()
    try:
        session.commit()
    except Exception:
        session.rollback()
        raise

    return route


def delete(route_id):
    route = get(route_id)
    session = get_session()
    session.delete(route)
    session.commit()


def check_rule(rule: RuleEntry):
    if not rule.has_operations:
        return

    try:
        build_pipeline(rule)
    except Exception as exc:
        logger.exception(exc)
        raise InvalidRouteConfiguration(f'Invalid operations: {exc}') from exc


def check_route(route: Route):
    for rule in route.rule_entries_list:
        check_rule(rule)
