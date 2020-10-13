# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['test_xml_ok[expressions0] 1'] = b'<CC>\n    <Foo>PREFIX<Bar>TEXT1</Bar>TEXT2<Bar>TEXT3</Bar>TAIL</Foo>\n    <Number>4111111111111111</Number>\n    <Number>4444333322221111</Number>\n    <CVC>123</CVC>\n</CC>'

snapshots['test_xml_ok[expressions1] 1'] = '''<CC>
    <Foo>PREFIX<Bar>TEXT1</Bar>TEXT2<Bar>TEXT3</Bar>TAIL</Foo>
    <Number>transformed_4111111111111111</Number><Number>transformed_4444333322221111</Number><CVC>transformed_123</CVC></CC>'''

snapshots['test_xml_ok[expressions2] 1'] = '''<CC>
    <Foo>transformed_PREFIXTEXT1TEXT2TEXT3TAIL</Foo><Number>4111111111111111</Number>
    <Number>4444333322221111</Number>
    <CVC>123</CVC>
</CC>'''
