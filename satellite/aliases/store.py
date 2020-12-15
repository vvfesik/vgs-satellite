from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm.query import Query

from satellite.db import get_session
from satellite.db.models import Alias


class AliasStore:
    def __init__(self, ttl: int = None):
        self._ttl = ttl

    @property
    def is_persistent(self):
        return self._ttl is None

    def get_by_value(self, value: str) -> Optional[Alias]:
        return self._query().filter(Alias.value == value).first()

    def get_by_alias(self, alias: str) -> Optional[Alias]:
        return self._query().filter(Alias.public_alias == alias).first()

    def _query(self) -> Query:
        query = get_session().query(Alias)
        if self.is_persistent:
            return query.filter(Alias.expires_at.is_(None))
        return query.filter(Alias.expires_at >= datetime.utcnow())

    def save(self, alias: Alias):
        session = get_session()
        if not self.is_persistent:
            alias.expires_at = datetime.utcnow() + timedelta(seconds=self._ttl)
        session.add(alias)
        session.commit()

    @staticmethod
    def cleanup() -> int:
        session = get_session()
        result = session.query(Alias).filter(
            Alias.expires_at < datetime.utcnow()
        ).delete()
        session.commit()
        return result
