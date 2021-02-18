import json
from unittest.mock import Mock, patch

from freezegun import freeze_time

from satellite.aliases import AliasGeneratorType, AliasStoreType
from satellite.aliases.manager import redact
from satellite.aliases.store import AliasStore
from .base import BaseHandlerTestCase


@freeze_time('2020-11-01')
class TestAliasesHandler(BaseHandlerTestCase):
    def test_post_ok(self):
        uuid_patch = patch(
            'satellite.aliases.manager.uuid.uuid4',
            Mock(
                side_effect=[
                    'c20b81b0-d90d-42d1-bf6d-eea5e6981196',
                    '884a0c8e-de04-46de-945a-c77c3acf783e',
                ]
            ),
        )
        uuid_patch.start()
        self.addCleanup(uuid_patch.stop)

        response = self.fetch(
            self.get_url('/aliases'),
            method='POST',
            body=json.dumps(
                {
                    'data': [
                        {'value': 123321, 'format': 'UUID'},
                        {'value': 'abccba', 'format': 'UUID'},
                    ]
                }
            ),
            headers={'Content-Type': 'application/json'},
        )

        self.assertEqual(response.code, 200, response.body)
        self.assertMatchSnapshot(json.loads(response.body))

        store = AliasStore()
        self.assertEqual(len(store.get_by_value('123321')), 1)
        self.assertEqual(len(store.get_by_value('abccba')), 1)

    def test_get_ok(self):
        uuid_patch = patch(
            'satellite.aliases.manager.uuid.uuid4',
            Mock(return_value='29e34c80-c9f2-4c59-97a5-355e1ed3018f'),
        )
        uuid_patch.start()
        self.addCleanup(uuid_patch.stop)

        alias = redact(
            '123321',
            generator_type=AliasGeneratorType.UUID,
            store_type=AliasStoreType.PERSISTENT,
        )

        response = self.fetch(self.get_url(f'/aliases?q={alias.public_alias}'))

        self.assertEqual(response.code, 200, response.body)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_get_not_found(self):
        response = self.fetch(self.get_url('/aliases'))

        self.assertEqual(response.code, 400, response.body)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_get_unknown_alias(self):
        uuid_patch = patch(
            'satellite.aliases.manager.uuid.uuid4',
            Mock(return_value='b93104db-67c3-4c11-9131-d4955e740a19'),
        )
        uuid_patch.start()
        self.addCleanup(uuid_patch.stop)

        alias = redact(
            '123321',
            generator_type=AliasGeneratorType.UUID,
            store_type=AliasStoreType.PERSISTENT,
        )

        response = self.fetch(
            self.get_url(
                f'/aliases?q={alias.public_alias},tok_tas_kgq94RpcPrAMSHJWh7o7P6',
            )
        )

        self.assertEqual(response.code, 200, response.body)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_get_missing_param(self):
        response = self.fetch(self.get_url('/aliases'))
        self.assertEqual(response.code, 400, response.body)


@freeze_time('2020-11-01')
class TestAliasHandler(BaseHandlerTestCase):
    def test_get_ok(self):
        uuid_patch = patch(
            'satellite.aliases.manager.uuid.uuid4',
            Mock(return_value='7612e3e6-0a62-4ed8-a329-403bd26ce538'),
        )
        uuid_patch.start()
        self.addCleanup(uuid_patch.stop)

        alias = redact(
            '123321',
            generator_type=AliasGeneratorType.UUID,
            store_type=AliasStoreType.PERSISTENT,
        )

        response = self.fetch(self.get_url(f'/aliases/{alias.public_alias}'))

        self.assertEqual(response.code, 200, response.body)
        self.assertMatchSnapshot(json.loads(response.body))

    def test_get_unknown_alias(self):
        response = self.fetch(
            self.get_url(
                '/aliases/tok_tas_kgq94RpcPrAMSHJWh7o7P6',
            )
        )

        self.assertEqual(response.code, 404, response.body)
        self.assertMatchSnapshot(json.loads(response.body))
