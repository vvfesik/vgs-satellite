import React from 'react';
import { Icon, Popover } from 'src/components/antd';
import definitions from 'src/data/terms';

interface IDocsPopoverProps {
  term?: string;
  iconClassName?: string;
  hint?: string | object;
}

class DocsPopover extends React.Component<IDocsPopoverProps> {
  render() {
    const { term, iconClassName, hint } = this.props;
    const definition = hint || definitions[term.toLowerCase()];

    return (
      <Popover
        content={definition}
        trigger="click"
        overlayStyle={{ maxWidth: '300px', zIndex: 1060 }}
        overlayClassName="text-sm"
      >
        <Icon
          type="question-circle"
          className={`d-inline-flex mr-2 text-text ${iconClassName}`}
          theme="filled"
          style={{ fontSize: '14px' }}
        />
      </Popover>
    );
  }
}

export default DocsPopover;
