import os
import locale

from multiprocessing import set_start_method

import click

from tblib import pickling_support

from satellite import db
from satellite import logging
from satellite.config import configure, init_satellite_dir, InvalidConfigError
from satellite.web_application import WebApplication


@click.command()
@click.option('--debug', is_flag=True, default=None)
@click.option('--web-server-port', type=int)
@click.option('--reverse-proxy-port', type=int)
@click.option('--forward-proxy-port', type=int)
@click.option(
    '--config-path',
    type=click.Path(exists=True, dir_okay=False),
    help='Path to a VGS Satellite config YAML file.',
)
@click.option(
    '--db-path',
    type=click.Path(dir_okay=False),
    help='Path to the VGS Satellite DB file.',
)
@click.option(
    '--log-path',
    type=click.Path(dir_okay=False),
    help='Path to a log file. If omitted log messages will appear only in stdout.',
)
@click.option(
    '--silent',
    is_flag=True,
    default=None,
    help='Do not log into stdout.',
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
    db.init()

    app = WebApplication(config)
    app.start()


if __name__ == '__main__':
    # Locale should be set before runing Click
    lang, encoding = locale.getdefaultlocale()
    if not lang or not encoding:
        os.environ['LC_ALL'] = 'en_US.utf-8'
    main()
