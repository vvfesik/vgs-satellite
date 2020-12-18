from typing import Callable

from lxml import etree

from . import Transformer, TransformerError


class XMLTransformer(Transformer):
    def transform(self, payload: str, operation: Callable) -> str:
        try:
            root = etree.fromstring(payload)
        except etree.XMLSyntaxError as exc:
            raise TransformerError(f'Invalid XML payload: {exc}.') from exc

        has_matches = False
        for expr in self.config.array:
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
