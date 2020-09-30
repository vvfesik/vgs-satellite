from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
engine = create_engine('sqlite:///route.sqlite')
Session = sessionmaker(bind=engine)


@contextmanager
def session_scope():
    session = Session()
    try:
        yield session
    finally:
        session.close()


class EntityAlreadyExists(BaseException):
    pass


def init_db():
    Base.metadata.create_all(engine)
