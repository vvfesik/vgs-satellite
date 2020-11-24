from abc import abstractmethod, ABCMeta
from base58 import b58encode
from typing import List


# Filled in by AliasGeneratorMeta
_supported_generators = {}


class AliasGeneratorMeta(ABCMeta):
    def __new__(mcls, name, bases, namespace, **kwargs):
        cls = super().__new__(mcls, name, bases, namespace, **kwargs)

        if name != 'AliasGenerator':
            if cls.generator_type is None:
                raise TypeError(f'Expected generator_type defined for {name}')
            _supported_generators[cls.generator_type] = cls

        return cls


class AliasGenerator(metaclass=AliasGeneratorMeta):
    generator_type: str = None

    @abstractmethod
    def generate(self, value):
        pass


class UUIDAliasGenerator(AliasGenerator):
    generator_type: str = 'UUID'

    def generate(self, value):
        return f'tok_sat_{b58encode(value).decode("UTF-8")}'[:30]


def get_generator(generator_type: str) -> AliasGenerator:
    generator_cls = _supported_generators.get(generator_type)
    if not generator_cls:
        allowed = ','.join(get_generator_types())
        raise ValueError(
            f'Unknown generator type: {generator_type}. Allowed types: {allowed}.'
        )
    return generator_cls()


def get_generator_types() -> List[str]:
    return list(_supported_generators)
