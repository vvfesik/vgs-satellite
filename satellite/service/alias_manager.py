import uuid

from satellite.vault.generator import generator_map

from satellite.model.base import Session
from satellite.model.alias import Alias, RevealFailed, RedactFailed


class AliasManager:
    def __init__(self):
        self.session = Session()

    def get_by_value(self, value):
        return self.session.query(Alias).filter(Alias.value == value).first()

    def get_by_alias(self, alias):
        return self.session.query(Alias).filter(Alias.public_alias == alias).first()

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
        self.session.add(alias)
        self.session.commit()
        return public_alias

    def reveal(self, alias):
        alias_entity = self.get_by_alias(alias)
        if not alias_entity:
            raise RevealFailed('Alias was not found!')
        return alias_entity.value
