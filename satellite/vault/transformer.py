import json
from abc import ABCMeta, abstractmethod
from typing import Callable, List, Union
from urllib.parse import parse_qsl, urlencode

from jsonpath_ng import parse

from lxml import etree


class TransformerError(Exception):
    pass


class PayloadTransformer(metaclass=ABCMeta):
    @abstractmethod
    def transform(
        self,
        payload: Union[str, bytes],
        transformer_array: List[str],
        operation: Callable,
    ) -> Union[str, bytes]:
        pass


class JsonTransformer(PayloadTransformer):
    def transform(
        self,
        payload: Union[str, bytes],
        transformer_array: List[str],
        operation: Callable,
    ):
        payload_json = json.loads(payload)
        for expression in transformer_array:
            json_expr = parse(expression)
            for match in json_expr.find(payload_json):
                json_expr.update(payload_json, operation(match.value))
        return json.dumps(payload_json)


class FormDataTransformer(PayloadTransformer):
    def transform(
        self,
        payload: Union[str, bytes],
        transformer_array: List[str],
        operation: Callable,
    ) -> str:
        result = []
        target_fields = set(transformer_array)
        if isinstance(payload, bytes):
            payload = payload.decode()

        for name, value in parse_qsl(payload, keep_blank_values=True):
            if value and name in target_fields:
                value = operation(value)
            result.append((name, value))

        return urlencode(result)


class XMLTransformer(PayloadTransformer):
    def transform(
        self,
        payload: Union[str, bytes],
        transformer_array: List[str],
        operation: Callable,
    ) -> str:
        try:
            root = etree.fromstring(payload)
        except etree.XMLSyntaxError as exc:
            raise TransformerError(f'Invalid XML payload: {exc}.') from exc

        has_matches = False
        for expr in transformer_array:
            try:
                for element in root.xpath(expr):
                    has_matches = True
                    self._transform(operation, element)

            except etree.XPathEvalError as exc:
                raise TransformerError(
                    f'Invalid XPath expression {expr}: {exc}.'
                ) from exc

        if has_matches:
            return etree.tostring(root, encoding='utf-8').decode('utf-8')

        return payload

    def _transform(self, operation: Callable, element: etree.ElementBase):
        value = ''.join(element.itertext())
        if not value:
            return
        element.clear()
        element.text = operation(value)


transformer_map = {
    'FORM_FIELD': FormDataTransformer(),
    'JSON_PATH': JsonTransformer(),
    'XPATH': XMLTransformer(),
}
