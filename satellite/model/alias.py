import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime

from satellite.model.base import Base


class Alias(Base):
    __tablename__ = 'aliases'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    value = Column(String)
    alias_generator = Column(String)
    public_alias = Column(String)

    def serialize(self):
        """Return object data in easily serializable format"""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'value': self.value,
            'alias_generator': self.alias_generator,
            'public_alias': self.public_alias
        }


class RedactFailed(BaseException):
    pass


class RevealFailed(BaseException):
    pass
