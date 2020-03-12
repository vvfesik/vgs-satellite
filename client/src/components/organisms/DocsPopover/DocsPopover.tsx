import React from 'react';
import PopoverBs from 'src/components/molecules/PopoverBs/PopoverBs';
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
      <PopoverBs
        iconName="info-circle"
        iconClassName={iconClassName}
      >
        {definition}
      </PopoverBs>
    );
  }
}

export default DocsPopover;
