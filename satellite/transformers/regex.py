import re
from functools import partial
from typing import Callable

from . import Transformer, TransformerError


class RegexTransformer(Transformer):
    def transform(self, payload: str, operation: Callable) -> str:
        for pattern in self.config.map['patterns']:
            if pattern:
                payload = self._transform(
                    payload=payload,
                    pattern=pattern,
                    replacement=self.config.map['replacement'],
                    operation=operation,
                )

        return payload

    def _transform(
        self,
        payload: str,
        pattern: str,
        replacement: str,
        operation: Callable,
    ) -> str:
        regex = self._build_regex(pattern)
        result = []
        pos = 0

        for match in regex.finditer(payload):
            result.append(payload[pos:match.start()])
            result.append(self._replace(match, replacement, operation))
            pos = match.end()

        result.append(payload[pos:])

        return ''.join(result)

    def _build_regex(self, pattern: str) -> re.Pattern:
        # Make named groups Python-compatible
        pattern = self._fix_pattern_groups(pattern)
        try:
            regex = re.compile(pattern)
        except re.error as error:
            raise TransformerError(f'Invalid pattern: {pattern}: {error}')
        return regex

    def _replace(self, match: re.Match, replacement: str, operation: Callable) -> str:
        groups = match.groupdict()

        if '%s' in replacement:
            token = groups.get('token')
            prefix = ''
            suffix = ''
            if token:
                # Looks like prefix/suffix groups matter only if token-group
                # was in a pattern
                prefix = groups.get('prefix', '')
                suffix = groups.get('suffix', '')
            else:
                token = match.group()

            alias = operation(token)

            replacement = replacement.replace('%s', prefix + alias + suffix)

        replacement = self._fix_replacement_groups(replacement)

        try:
            return match.expand(replacement)
        except IndexError as error:
            raise TransformerError(f'Invalid replacement: {error}')

    _fix_pattern_groups = partial(re.compile(r'\(\?\<(\w+)\>').sub, r'(?P<\1>')

    _fix_replacement_groups = partial(re.compile(r'\$\{(\w+)\}').sub, r'\\g<\1>')
