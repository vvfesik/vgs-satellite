from ..db import EntityAlreadyExists, get_session
from ..db.models.route import Route, RuleEntry, RouteType


class RouteManager:
    def get_all(self):
        return get_session().query(Route).all()

    def get_all_by_type(self, route_type: RouteType):
        route_all = self.get_all()
        if route_type == RouteType.OUTBOUND:
            return [route for route in route_all if route.is_outbound()]
        else:
            return [route for route in route_all if not route.is_outbound()]

    def get_all_serialized(self):
        route_all = self.get_all()
        return [] if len(route_all) == 0 else [route.serialize() for route in route_all]

    def get(self, route_id):
        return get_session().query(Route).filter(Route.id == route_id).first()

    def create(self, route):
        route_id = route['id'] if 'id' in route else None
        if self.get(route_id):
            raise EntityAlreadyExists(route_id)
        route_entity = self.__parse_route(route, route_id)
        session = get_session()
        session.add(route_entity)
        session.commit()
        return route_entity.serialize()

    def update(self, route_id, route):
        if self.get(route_id):
            self.delete(route_id)
        route['id'] = route_id
        return self.create(route)

    def delete(self, route_id):
        route = self.get(route_id)
        session = get_session()
        session.delete(route)
        session.commit()

    def __parse_route(self, route, route_id):
        return Route(id=route_id,
                     protocol=route.get('protocol'),
                     source_endpoint=route.get('source_endpoint'),
                     destination_override_endpoint=route.get('destination_override_endpoint'),
                     host_endpoint=route.get('host_endpoint'),
                     port=route.get('port'),
                     tags=route.get('tags'),
                     rule_entries_list=self.__parse_route_entries(route.get('entries'))
                     )

    def __parse_route_entries(self, route_entries):
        entries = []
        for entry in route_entries:
            entry_id = entry.get('id') if 'id' in entry else None
            rule_entry = RuleEntry(
                id=entry_id,
                phase=entry.get('phase'),
                operation=entry.get('operation'),
                token_manager=entry.get('token_manager'),
                public_token_generator=entry.get('public_token_generator'),
                transformer=entry.get('transformer'),
                transformer_config=entry.get('transformer_config'),
                targets=entry.get('targets'),
                classifiers=entry.get('classifiers'),
                expression_snapshot=entry.get('config')
            )
            entries.append(rule_entry)
        return entries
