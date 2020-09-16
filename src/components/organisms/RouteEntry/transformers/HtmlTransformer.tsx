import React from 'react';
import { Label, Popover, PopoverBody } from 'reactstrap';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import StringsArray from 'src/components/atoms/StringsArray/StringsArray';
import { ITransformerProps, ITransformerState } from '.';

export class HtmlTransformer extends React.Component<ITransformerProps, ITransformerState> {
  state = {
    popoverOpen: false,
  };

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  }

  isValid(value: string) {
    if (!value) return true;
    try {
      document.querySelector(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  onChange(ops: string[]) {
    this.props.onChange(ops);

    const allValid = ops.some(op => this.isValid(op));

    if (!allValid) {
      this.setState({ popoverOpen: true });
    }
  }

  render () {
    return (
      <React.Fragment>
        <Label className="text-muted mr-sm-2 popover-target" data-role="html-selector-info">
          Selector in HTML
          <DocsPopover hint={
            <div>
              <p>
                Example: <mark>.className</mark>
              </p>
              <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors" target="_blank">
                Selectors documentation
              </a>
            </div>
          } />
        </Label>
        <StringsArray
          values={this.props.operations}
          onChange={(ops: string[]) => this.onChange(ops)}
          validator={value => this.isValid(value)}
          placeholder=".account-number"
        />
        <Popover
          placement="top"
          isOpen={this.state.popoverOpen}
          target=".popover-target"
          toggle={() => this.toggle()}
        >
          <PopoverBody>
            <p>
              <span onClick={() => this.toggle()} className="inilne-block">
                <i className="fa fa-times btn-icon pull-right"/>
              </span>
              You've entered invalid selector
            </p>
            <p>
              Example: <mark>.className</mark>
            </p>
            <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors" target="_blank">
              Selectors documentation
            </a>
          </PopoverBody>
        </Popover>
      </React.Fragment>
    );
  }
}
