from abc import ABC, abstractmethod

from base58 import b58encode

from . import AliasGeneratorType


class AliasGenerator(ABC):
    @abstractmethod
    def generate(self, value):
        pass


class UUIDAliasGenerator(AliasGenerator):
    def generate(self, value):
        return f'tok_sat_{b58encode(value).decode("UTF-8")}'[:30]


def get_alias_generator(generator_type: AliasGeneratorType) -> AliasGenerator:
    return _supported_generators[generator_type]


_supported_generators = {
    AliasGeneratorType.UUID: UUIDAliasGenerator(),
}
