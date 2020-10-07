import dataclasses

from pathlib import Path

import marshmallow_dataclass

from ruamel.yaml import YAML


DEFAULT_CONFIG_PATH = '~/.vgs-satellite/config.yml'


@dataclasses.dataclass(frozen=True)
class SatelliteConfig:
    web_server_port: int = 8089
    reverse_proxy_port: int = 9098
    forward_proxy_port: int = 9099


SatelliteConfigSchema = marshmallow_dataclass.class_schema(SatelliteConfig)


class InvalidConfigError(Exception):
    pass


def configure(config_path: str = None, **kwargs):
    params_from_file = _get_params_from_config_file(config_path)
    return SatelliteConfig(**{**params_from_file, **kwargs})


def _get_params_from_config_file(config_path: str = None) -> dict:
    for path in filter(None, [config_path, DEFAULT_CONFIG_PATH]):
        path = Path(path).expanduser().resolve()
        if path.exists():
            return _load_params_from_file(path)
    return {}


def _load_params_from_file(path: Path) -> dict:
    try:
        with open(path) as stream:
            params = YAML().load(stream)
    except Exception as exc:
        raise InvalidConfigError(f'Invalid config file: {exc}.') from exc

    # schema =
    errors = SatelliteConfigSchema(unknown='EXCLUDE').validate(params)
    if errors:
        raise InvalidConfigError(errors)

    return {}

    # known_params = set(
    #     field.name for field in dataclasses.fields(SatelliteConfig)
    # )
    # return {
    #     name: value
    #     for name, value in params.items()
    #     if name in known_params
    # }
