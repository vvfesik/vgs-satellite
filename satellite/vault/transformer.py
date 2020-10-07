import json

from abc import abstractmethod, ABCMeta
from typing import List, Union
from urllib.parse import parse_qsl, urlencode

from jsonpath_ng import parse
from satellite.model.route import Operation
from satellite.service import alias_manager


class PayloadTransformer(metaclass=ABCMeta):
    @abstractmethod
    def transform(
        self,
        payload: Union[str, bytes],
        transformer_array: List[str],
        token_generator: str,
        operation: Operation,
    ) -> Union[str, bytes]:
        pass


class JsonTransformer(PayloadTransformer):
    def transform(self, payload, transformer_array, token_generator, operation):
        payload_json = json.loads(payload)
        for expression in transformer_array:
            json_expr = parse(expression)
            for match in json_expr.find(payload_json):
                json_expr.update(payload_json, transform(match.value, operation, token_generator))
        return json.dumps(payload_json)


class FormDataTransformer(PayloadTransformer):
    def transform(
        self,
        payload: Union[str, bytes],
        transformer_array: List[str],
        token_generator: str,
        operation: Operation,
    ) -> str:
        result = []
        target_fields = set(transformer_array)
        if isinstance(payload, bytes):
            payload = payload.decode()

        for name, value in parse_qsl(payload, keep_blank_values=True):
            if value and name in target_fields:
                value = transform(value, operation, token_generator)
            result.append((name, value))

        return urlencode(result)


def transform(value, operation, token_generator='UUID'):
    if operation == Operation.REDACT.value:
        return alias_manager.redact(value, token_generator)
    else:
        return alias_manager.reveal(value)


transformer_map = {
    'FORM_FIELD': FormDataTransformer(),
    'JSON_PATH': JsonTransformer(),
}
