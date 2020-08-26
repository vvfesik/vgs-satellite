import React from 'react';
import DocsPopover from '../DocsPopover';
import ShallowRenderer from 'react-test-renderer/shallow';
const renderer = new ShallowRenderer();

test('DocsPopover', () => {
  const component = renderer.render(
    <DocsPopover term="Upstream host" />,
  );
  expect(component).toMatchSnapshot();
});
