import uuid
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship

from .. import Base


class Route(Base):
    __tablename__ = 'rule_chains'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    protocol = Column(String)
    source_endpoint = Column(String)
    destination_override_endpoint = Column(String)
    host_endpoint = Column(String)
    port = Column(Integer)
    tags = Column(JSON)
    rule_entries_list = relationship(
        'RuleEntry',
        back_populates='rule_chain',
        cascade='all, delete, delete-orphan',
        passive_deletes=True,
    )

    @property
    def route_type(self):
        return RouteType.OUTBOUND if self.is_outbound() else RouteType.INBOUND

    def is_outbound(self):
        return self.destination_override_endpoint == '*'


class RuleEntry(Base):
    __tablename__ = 'rule_entries'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    route_id = Column(String, ForeignKey('rule_chains.id', ondelete='CASCADE'))
    rule_chain = relationship('Route', back_populates='rule_entries_list')
    phase = Column(String)
    operation = Column(String)
    token_manager = Column(String)
    public_token_generator = Column(String)
    transformer = Column(String)
    transformer_config = Column(JSON)
    targets = Column(JSON)
    classifiers = Column(JSON)
    expression_snapshot = Column(JSON)


class RouteType(Enum):
    INBOUND = 'INBOUND'
    OUTBOUND = 'OUTBOUND'


class Phase(Enum):
    REQUEST = 'REQUEST'
    RESPONSE = 'RESPONSE'


class Operation(Enum):
    REDACT = 'REDACT'
    ENRICH = 'ENRICH'
