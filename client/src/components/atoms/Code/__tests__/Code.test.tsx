import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import Code from '../Code';
const renderer = new ShallowRenderer();

describe('Code renders', () => {
  const sampleYaml = 'data:\n- attributes:\n';

  it('should render correctly with numbers', () => {
    const component = renderer.render(
      <Code numbers language="yaml">{sampleYaml}</Code>,
    );
    expect(component).toMatchSnapshot();
  });
});
