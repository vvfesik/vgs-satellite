import json

from abc import abstractmethod, ABCMeta
from jsonpath_ng import parse
from satellite.model.route import Operation
from satellite.service import alias_manager


class PayloadTransformer(metaclass=ABCMeta):
    @abstractmethod
    def transform(self, payload, transformer_array, token_generator, operation):
        pass


class JsonTransformer(PayloadTransformer):
    def transform(self, payload, transformer_array, token_generator, operation):
        payload_json = json.loads((payload.decode()))
        for expression in transformer_array:
            json_expr = parse(expression)
            for match in json_expr.find(payload_json):
                json_expr.update(payload_json, transform(match.value, operation, token_generator))
        return json.dumps(payload_json)


def transform(value, operation, token_generator='UUID'):
    if operation == Operation.REDACT.value:
        return alias_manager.redact(value, token_generator)
    else:
        return alias_manager.reveal(value)


transformer_map = {
    'JSON_PATH': JsonTransformer()
}
