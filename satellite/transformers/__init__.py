from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum, unique
from typing import Callable


@unique
class TransformerType(Enum):
    FORM_FIELD = 'FORM_FIELD'
    JSON_PATH = 'JSON_PATH'
    XPATH = 'XPATH'
    REGEX = 'REGEX'


@dataclass
class TransformerConfig:
    array: list
    map: dict = None


class Transformer(ABC):
    def __init__(self, config: TransformerConfig):
        self.config = config

    @abstractmethod
    def transform(self, payload: str, operation: Callable) -> str:
        pass


class TransformerError(Exception):
    pass
