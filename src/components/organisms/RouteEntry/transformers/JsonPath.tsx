import React from 'react';
import { Label, Popover, PopoverBody } from 'reactstrap';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import StringsArray from 'src/components/atoms/StringsArray/StringsArray';
import { ITransformerProps, ITransformerState } from '.';

export class JsonPath extends React.Component<ITransformerProps, ITransformerState> {
  state = {
    popoverOpen: false,
  };

  togglePopover() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  }

  isValid (value: string) {
    if (!value) {
      return true;
    }

    return /.*\.{1,2}.*\S.*/.test(value);
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
        <Label className="text-muted mr-sm-2 popover-target">
          Fields in JSON path <DocsPopover term="json path" />
        </Label>
        <StringsArray
          values={this.props.operations}
          onChange={(ops: string[]) => this.onChange(ops)}
          validator={this.isValid}
          placeholder="$.account_number"
        />
        <Popover
          placement="top"
          isOpen={this.state.popoverOpen}
          target=".popover-target"
          toggle={() => this.togglePopover()}
        >
          <PopoverBody>
            <p>
              <span onClick={() => this.togglePopover()} className="inilne-block">
                  <i className="fa fa-times btn-icon pull-right"/>
              </span>
              JSON Path should start with <mark>$</mark> sign and be separated by <mark>.</mark> sign</p>
            <p>
              Example: <mark>$.creditcard.cardnumber</mark>
            </p>
            <a href="http://goessner.net/articles/JsonPath/" target="_blank">JSON path documentation</a>
          </PopoverBody>
        </Popover>
      </React.Fragment>
    );
  }
}
