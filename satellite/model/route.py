import uuid
from enum import Enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from satellite.model.base import Base


class Route(Base):
    __tablename__ = 'rule_chains'

    id = Column(String, primary_key=True, default=str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    protocol = Column(String)
    source_endpoint = Column(String)
    destination_override_endpoint = Column(String)
    host_endpoint = Column(String)
    port = Column(Integer)
    tags = Column(JSON)
    rule_entries_list = relationship("RuleEntry", back_populates="rule_chain", cascade="all, delete, delete-orphan")

    @property
    def route_type(self):
        return RouteType.OUTBOUND if self.is_outbound() else RouteType.INBOUND

    def is_outbound(self):
        return self.destination_override_endpoint == '*'

    def serialize(self):
        """Return object data in easily serializable format"""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'protocol': self.protocol,
            'source_endpoint': self.source_endpoint,
            'destination_override_endpoint': self.destination_override_endpoint,
            'host_endpoint': self.host_endpoint,
            'port': self.port,
            'tags': self.tags,
            'entries': [entry.serialize() for entry in self.rule_entries_list]
        }


class RuleEntry(Base):
    __tablename__ = 'rule_entries'

    id = Column(String, primary_key=True, default=str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    route_id = Column(String, ForeignKey('rule_chains.id'))
    rule_chain = relationship("Route", back_populates='rule_entries_list')
    phase = Column(String)
    operation = Column(String)
    token_manager = Column(String)
    public_token_generator = Column(String)
    transformer = Column(String)
    transformer_config = Column(JSON)
    targets = Column(JSON)
    classifiers = Column(JSON)
    expression_snapshot = Column(JSON)

    def serialize(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'phase': self.phase,
            'token_manager': self.token_manager,
            'public_token_generator': self.public_token_generator,
            'transformer': self.transformer,
            'transformer_config': self.transformer_config,
            'operation': self.operation,
            'targets': self.targets,
            'classifiers': self.classifiers,
            'config': self.expression_snapshot
        }


class RouteType(Enum):
    INBOUND = 'INBOUND'
    OUTBOUND = 'OUTBOUND'


class Phase(Enum):
    REQUEST = 'REQUEST'
    RESPONSE = 'RESPONSE'


class Operation(Enum):
    REDACT = 'REDACT'
    ENRICH = 'ENRICH'
