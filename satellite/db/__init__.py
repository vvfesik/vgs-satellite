import threading

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


class EntityAlreadyExists(Exception):
    pass


def configure(db_path: str):
    global _engine
    global _Session

    _engine = create_engine(f'sqlite:///{db_path}')
    _Session = sessionmaker(bind=_engine)


def get_session():
    if not hasattr(_session_store, 'session'):
        _session_store.session = _Session()
    return _session_store.session


def init():
    Base.metadata.create_all(_engine)


_engine = None
_Session = None
_session_store = threading.local()
