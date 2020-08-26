import React from 'react';
import { uniqueId } from 'lodash';
import { Popover, PopoverBody } from 'reactstrap';
import Icon from 'src/components/atoms/Icon/Icon';

interface IPopoverBsProps {
  iconName: string;
  iconType?: string;
  placement?: string;
  label?: string;
  iconClassName?: string;
  className?: string;
}

interface IPopoverBsState {
  popoverOpen: boolean;
}

export default class PopoverBs extends React.Component<IPopoverBsProps, IPopoverBsState> {
  id = this.generateId();
  constructor(props: IPopoverBsProps) {
    super(props);

    this.state = {
      popoverOpen: false,
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  }

  generateId() {
    return uniqueId('popoverid_');
  }

  render() {
    const { iconName, placement, children, label, iconType, iconClassName, className } = this.props;
    const { popoverOpen } = this.state;

    return (
      <span>
        <Icon
          name={iconName}
          id={this.id}
          type={iconType}
          onClick={() => this.toggle()}
          сlassName={iconClassName}
        /> {label ? <a href="#" onClick={() => this.toggle()}>{label}</a> : ''}
        <Popover
          placement={placement}
          isOpen={popoverOpen}
          target={this.id}
          toggle={this.toggle}
          className={className}
        >
          <PopoverBody>{children}</PopoverBody>
        </Popover>
      </span>
    );
  }
}

PopoverBs.defaultProps = {
  placement: 'top',
};
