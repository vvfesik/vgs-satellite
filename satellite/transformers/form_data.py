from typing import Callable
from urllib.parse import parse_qsl, urlencode

from . import Transformer


class FormDataTransformer(Transformer):
    def transform(self, payload: str, operation: Callable) -> str:
        result = []
        target_fields = set(self.config.array)
        if isinstance(payload, bytes):
            payload = payload.decode()

        for name, value in parse_qsl(payload, keep_blank_values=True):
            if value and name in target_fields:
                value = operation(value)
            result.append((name, value))

        return urlencode(result)
