import json
import logging

from abc import abstractmethod, ABCMeta
from typing import List, Union
from urllib.parse import parse_qsl, urlencode

from jsonpath_ng import parse
from lxml import etree

from satellite.model.route import Operation
from satellite.service import alias_manager


logger = logging.getLogger(__file__)


class TransformerError(Exception):
    pass


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


class XMLTransformer(PayloadTransformer):
    def transform(
        self,
        payload: Union[str, bytes],
        transformer_array: List[str],
        token_generator: str,
        operation: Operation,
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
                    self._transform(token_generator, operation, element)

            except etree.XPathEvalError as exc:
                raise TransformerError(
                    f'Invalid XPath expression {expr}: {exc}.'
                ) from exc

        if has_matches:
            return etree.tostring(root, encoding='utf-8').decode('utf-8')

        return payload

    def _transform(
        self,
        token_generator: str,
        operation: Operation,
        element: etree.ElementBase,
    ):
        value = ''.join(element.itertext())
        if not value:
            return
        element.clear()
        element.text = transform(value, operation, token_generator)


def transform(value, operation, token_generator='UUID'):
    if operation == Operation.REDACT.value:
        return alias_manager.redact(value, token_generator)
    else:
        return alias_manager.reveal(value)


transformer_map = {
    'FORM_FIELD': FormDataTransformer(),
    'JSON_PATH': JsonTransformer(),
    'XPATH': XMLTransformer(),
}
