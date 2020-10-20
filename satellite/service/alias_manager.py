import uuid

from ..db import get_session
from ..db.models.alias import Alias, RevealFailed, RedactFailed
from ..vault.generator import generator_map


class AliasManager:
    def get_by_value(self, value):
        return get_session().query(Alias).filter(Alias.value == value).first()

    def get_by_alias(self, alias):
        return get_session().query(Alias).filter(Alias.public_alias == alias).first()

    def redact(self, value, alias_generator):
        alias_entity = self.get_by_value(value)
        if alias_entity:
            return alias_entity.public_alias
        alias_generator_type = generator_map.get(alias_generator)
        alias_id = str(uuid.uuid4())
        if not alias_generator_type:
            raise RedactFailed(
                f'{alias_generator} can\'t be used as a alias generator. '
                f'Possible values: {str(alias_generator.keys())}'
            )
        public_alias = alias_generator_type.generate(alias_id)
        alias = Alias(id=alias_id,
                      value=value,
                      alias_generator=alias_generator,
                      public_alias=public_alias)
        session = get_session()
        session.add(alias)
        session.commit()
        return public_alias

    def reveal(self, alias):
        alias_entity = self.get_by_alias(alias)
        if not alias_entity:
            raise RevealFailed('Alias was not found!')
        return alias_entity.value
