import locale
import os
from multiprocessing import set_start_method

import click

from tblib import pickling_support

from satellite import db
from satellite import logging
from satellite.config import InvalidConfigError, configure, init_satellite_dir
from satellite.web_application import WebApplication


@click.command()
@click.option('--debug', is_flag=True, default=None, envvar='SATELLITE_DEBUG')
@click.option('--web-server-port', type=int, envvar='SATELLITE_API_PORT')
@click.option(
    '--reverse-proxy-port',
    type=int,
    envvar='SATELLITE_REVERSE_PROXY_PORT',
)
@click.option(
    '--forward-proxy-port',
    type=int,
    envvar='SATELLITE_FORWARD_PROXY_PORT',
)
@click.option(
    '--config-path',
    type=click.Path(exists=True, dir_okay=False),
    help='Path to a VGS Satellite config YAML file.',
    envvar='SATELLITE_CONFIG_PATH',
)
@click.option(
    '--db-path',
    type=click.Path(dir_okay=False),
    help='Path to the VGS Satellite DB file.',
    envvar='SATELLITE_DB_PATH',
)
@click.option(
    '--log-path',
    type=click.Path(dir_okay=False),
    help='Path to a log file. If omitted log messages will appear only in stdout.',
    envvar='SATELLITE_LOG_PATH',
)
@click.option(
    '--silent',
    is_flag=True,
    default=None,
    help='Do not log into stdout.',
    envvar='SATELLITE_SILENT',
)
def main(**kwargs):
    set_start_method('fork')  # PyInstaller supports only fork start method

    pickling_support.install()

    init_satellite_dir()

    try:
        config = configure(**{
            name: value
            for name, value in kwargs.items()
            if value is not None
        })
    except InvalidConfigError as exc:
        raise click.ClickException(f'Invalid config: {exc}') from exc

    logging.configure(log_path=config.log_path, silent=config.silent)

    db.configure(config.db_path)
    try:
        db.init()
    except db.DBVersionMismatch as exc:
        raise click.ClickException(exc) from exc

    app = WebApplication(config)
    app.start()


if __name__ == '__main__':
    # Locale should be set before runing Click
    lang, encoding = locale.getdefaultlocale()
    if not lang or not encoding:
        os.environ['LC_ALL'] = 'en_US.utf-8'
    main()
