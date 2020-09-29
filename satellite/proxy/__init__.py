from enum import Enum, unique


@unique
class ProxyMode(Enum):
    FORWARD = 'regular'
    REVERSE = 'reverse'
