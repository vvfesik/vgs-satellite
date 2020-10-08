import click

from satellite.config import configure, InvalidConfigError
from satellite.logging import configure_logging
from satellite.web_application import WebApplication


@click.command()
@click.option('--web-server-port', type=int)
@click.option('--reverse-proxy-port', type=int)
@click.option('--forward-proxy-port', type=int)
@click.option(
    '--config-path',
    type=click.Path(exists=True, dir_okay=False),
    help='Path to a VGS Satellite config YAML file.',
)
def main(**kwargs):
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
    main()
