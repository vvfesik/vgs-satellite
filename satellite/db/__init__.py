import threading

from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.session import Session


Base = declarative_base()


class EntityAlreadyExists(Exception):
    pass


def configure(db_path: str):
    global _engine
    global _Session

    _engine = create_engine(f'sqlite:///{db_path}')
    _Session = sessionmaker(bind=_engine)


def get_session() -> Session:
    if not hasattr(_session_store, 'session'):
        _session_store.session = _Session()
    return _session_store.session


def init():
    Base.metadata.create_all(_engine)


def update_model(model: Base, data: dict, exclude_fields=None):
    for name, value in data.items():
        exclude = exclude_fields and name in exclude_fields
        if not exclude and name in model.__table__.columns:
            setattr(model, name, value)


@event.listens_for(Engine, 'connect')
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute('PRAGMA foreign_keys=ON')
    cursor.close()


_engine = None
_Session = None
_session_store = threading.local()
