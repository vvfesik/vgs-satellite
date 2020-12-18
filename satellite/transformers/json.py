import json
from typing import Callable

from jsonpath_ng import parse

from . import Transformer


class JsonTransformer(Transformer):
    def transform(self, payload: str, operation: Callable) -> str:
        payload_json = json.loads(payload)
        for expression in self.config.array:
            json_expr = parse(expression)
            for match in json_expr.find(payload_json):
                json_expr.update(payload_json, operation(match.value))
        return json.dumps(payload_json)
