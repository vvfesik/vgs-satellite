from enum import Enum, unique


@unique
class RouteType(Enum):
    INBOUND = 'INBOUND'
    OUTBOUND = 'OUTBOUND'


@unique
class Phase(Enum):
    REQUEST = 'REQUEST'
    RESPONSE = 'RESPONSE'


@unique
class Operation(Enum):
    ENRICH = 'ENRICH'
    REDACT = 'REDACT'
