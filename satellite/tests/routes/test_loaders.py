from io import StringIO
from unittest.mock import Mock

import pytest
from sqlalchemy.exc import DatabaseError

from satellite.routes.loaders import LoadError, load_from_yaml
from satellite.routes.manager import InvalidRouteConfiguration


ROUTES_YAML = r"""data:
- attributes:
    created_at: '2020-09-23T12:02:08'
    destination_override_endpoint: '*'
    entries:
    - classifiers: {}
      config:
        condition: AND
        expression: null
        rules:
        - condition: null
          expression:
            field: PathInfo
            operator: matches
            type: string
            values:
            - /post
          rules: null
        - condition: null
          expression:
            field: ContentType
            operator: equals
            type: string
            values:
            - application/json
          rules: null
      id: e38880f1-9a9c-4268-a801-abb233706c47
      id_selector: null
      operation: ENRICH
      operations: null
      phase: REQUEST
      public_token_generator: UUID
      targets:
      - body
      token_manager: PERSISTENT
      transformer: JSON_PATH
      transformer_config:
      - $.account_number
      transformer_config_map: null
    host_endpoint: httpbin\.org
    id: 61020004-b587-4844-9e1d-a0ab980a8d52
    ordinal: null
    port: 80
    protocol: http
    source_endpoint: '*'
    tags:
      name: royal-blue-hexagon
      source: RouteContainer
    updated_at: '2021-01-12T16:04:41'
  id: 61020004-b587-4844-9e1d-a0ab980a8d52
  type: rule_chain
- attributes:
    created_at: '2020-10-05T14:14:16'
    destination_override_endpoint: https://httpbin.org
    entries:
    - classifiers: {}
      config:
        condition: AND
        expression: null
        rules:
        - condition: null
          expression:
            field: PathInfo
            operator: matches
            type: string
            values:
            - /post
          rules: null
        - condition: null
          expression:
            field: ContentType
            operator: equals
            type: string
            values:
            - application/json
          rules: null
      id: a88cd74f-90c3-41c9-b353-5edbfb1cd03d
      id_selector: null
      operation: REDACT
      operations: null
      phase: REQUEST
      public_token_generator: UUID
      targets:
      - body
      token_manager: PERSISTENT
      transformer: JSON_PATH
      transformer_config:
      - $.account_number
      transformer_config_map: null
    host_endpoint: (.*)\.verygoodproxy\.com
    id: 6905f9d6-9fc2-4c7e-a67d-a5a730adcdbf
    ordinal: null
    port: 80
    protocol: http
    source_endpoint: '*'
    tags:
      name: echo.apps.verygood.systems-lemon-chiffon-rhombus
      source: RouteContainer
    updated_at: '2020-12-15T11:43:12'
  id: 6905f9d6-9fc2-4c7e-a67d-a5a730adcdbf
  type: rule_chain
version: 1"""


def test_load_from_yaml_ok(monkeypatch, snapshot):
    mock_replace = Mock()
    monkeypatch.setattr(
        'satellite.routes.loaders.route_manager.replace',
        mock_replace,
    )

    res = load_from_yaml(StringIO(ROUTES_YAML))
    assert res == 2
    mock_replace.assert_called_once()
    snapshot.assert_match(list(mock_replace.call_args))


def test_load_from_yaml_invalid_yaml():
    with pytest.raises(LoadError) as ctx:
        load_from_yaml(StringIO('{invalid'))
    assert str(ctx.value).startswith('Unable to parse config')


def test_load_from_yaml_failed_validation():
    with pytest.raises(LoadError) as ctx:
        load_from_yaml(
            StringIO(
                ROUTES_YAML.replace(
                    'public_token_generator: UUID',
                    'public_token_generator: UNKNOWN',
                )
            )
        )
    assert str(ctx.value).startswith('Invalid routes data')


def test_load_from_yaml_failed_failed_route_check(monkeypatch):
    monkeypatch.setattr(
        'satellite.routes.loaders.route_manager.replace',
        Mock(side_effect=InvalidRouteConfiguration('test error')),
    )
    with pytest.raises(LoadError) as ctx:
        load_from_yaml(StringIO(ROUTES_YAML))
    assert str(ctx.value) == 'Invalid routes config: test error'


def test_load_from_yaml_failed_db_error(monkeypatch):
    monkeypatch.setattr(
        'satellite.routes.loaders.route_manager.replace',
        Mock(side_effect=DatabaseError(Mock(), Mock(), Mock())),
    )
    with pytest.raises(LoadError) as ctx:
        load_from_yaml(StringIO(ROUTES_YAML))
    assert str(ctx.value).startswith('Unable to load routes into the DB')
