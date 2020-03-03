import React from 'react';
import { Tooltip } from 'reactstrap';

export interface IStringWrapperProps {
  size: number;
  children: string;
  id: string;
  tooltipText?: string;
  showAlways?: boolean;
  cutMiddle?: boolean;
}
export interface IStringWrapperState {
  tooltipOpen: boolean;
}
// tslint:disable-next-line
export default class StringWrapper extends React.Component <IStringWrapperProps, IStringWrapperState> {
  constructor(props: IStringWrapperProps) {
    super(props);

    this.state = {
      tooltipOpen: false,
    };
  }

  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  render() {
    const text = this.props.children;
    const className = `path-wrapper-${this.props.id}`;
    const isCut = text.length > this.props.size;
    const cutText = this.props.cutMiddle
      ? `${text.slice(0, this.props.size / 2)}…${text.slice(-this.props.size / 2)}`
      : `…${text.slice(-this.props.size)}`;
    return (
      <div className="string-wrapper">
        <span className={`${className}`}>
          {isCut && !this.props.tooltipText ? cutText : text}
        </span>
        {
          (isCut || this.props.showAlways) &&
            <Tooltip
              className="string-wrapper-tooltip"
              placement="top"
              isOpen={this.state.tooltipOpen}
              autohide={false}
              target={`.${className}`}
              toggle={() => this.toggle()}
            >
              {this.props.tooltipText ? this.props.tooltipText : text}
            </Tooltip>
        }
      </div>
    );
  }
}
