import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String

from .. import Base


class Alias(Base):
    __tablename__ = 'aliases'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.utcnow())
    value = Column(String)
    alias_generator = Column(String)
    public_alias = Column(String)


class RedactFailed(BaseException):
    pass


class RevealFailed(BaseException):
    pass
