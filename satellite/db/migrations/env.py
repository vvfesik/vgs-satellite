from logging.config import fileConfig

from alembic import context

from satellite import db
from satellite.config import configure as sat_configure
from satellite.db.models import Base


alembic_cfg = context.config

engine = db.get_engine()
if engine is None:
    sat_config = sat_configure()
    db.configure(sat_config.db_path)
    fileConfig(alembic_cfg.config_file_name)

alembic_cfg.attributes['engine'] = db.get_engine()

target_metadata = Base.metadata


def run_migrations_online():
    with alembic_cfg.attributes['engine'].connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
