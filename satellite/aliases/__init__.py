from enum import Enum, unique


class RedactFailed(BaseException):
    pass


class RevealFailed(BaseException):
    pass


@unique
class AliasGeneratorType(Enum):
    UUID = 'UUID'


@unique
class AliasStoreType(Enum):
    PERSISTENT = 'PERSISTENT'
    VOLATILE = 'VOLATILE'
