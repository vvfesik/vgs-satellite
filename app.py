import locale

from multiprocessing import set_start_method

import click

from satellite.config import configure, InvalidConfigError
from satellite.logging import configure_logging
from satellite.web_application import WebApplication


@click.command()
@click.option('--debug', is_flag=True)
@click.option('--web-server-port', type=int)
@click.option('--reverse-proxy-port', type=int)
@click.option('--forward-proxy-port', type=int)
@click.option(
    '--config-path',
    type=click.Path(exists=True, dir_okay=False),
    help='Path to a VGS Satellite config YAML file.',
)
def main(**kwargs):
    set_start_method('fork')  # PyInstaller supports only fork start method

    configure_logging()

    try:
        config = configure(**{
            name: value
            for name, value in kwargs.items()
            if value is not None
        })
    except InvalidConfigError as exc:
        raise click.ClickException(f'Invalid config: {exc}') from exc

    app = WebApplication(config)
    app.start()


if __name__ == '__main__':
    # Locale should be set before runing Click
    _, encoding = locale.getlocale()
    if not encoding:
        locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
    main()
