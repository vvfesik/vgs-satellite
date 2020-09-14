import React from 'react';
import { Input, Label, Popover, PopoverBody, FormGroup } from 'reactstrap';
import { ITransformerProps, ITransformerState } from '.';

export class Csv extends React.Component<ITransformerProps, ITransformerState> {
  state = {
    popoverOpen: false,
    isValid: true,
  };

  togglePopover() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  }

  isValid (value: string) {
    if (!value || !value[0]) {
      return true;
    }
    return /^\[\d+(,(| )\d+)*\]$/.test(value);
  }

  onChangeValue(value: string) {
    const operations = this.props.operations;
    operations[0] = value;
    operations[1] = !operations[1] ? 'true' : operations[1];
    this.props.onChange(operations);

    const allValid = operations.some(op => this.isValid(op));
    if (!allValid) {
      this.setState({ popoverOpen: true });
    }
  }

  handleCheckChange(e: any) {
    const { checked } = e.target;
    const operations = this.props.operations;
    operations[1] = checked ? 'true' : 'false';
    this.props.onChange(operations);
  }

  render () {
    return (
      <React.Fragment>
        <Label className="text-muted mr-sm-2 popover-target">
          Column number in CSV
        </Label>
        <div className="mb-1 row no-gutters">
          <Input
            type="text"
            name="text"
            placeholder="[1,2]"
            data-role="operation-field-input"
            className={`${this.isValid(this.props.operations[0]) ? '' : 'is-invalid'}`}
            value={this.props.operations[0]}
            onChange={e => this.onChangeValue(e.target.value)}
          />
        </div>
        <FormGroup check>
          <Label check>
            <Input
              type="checkbox"
              onChange={e => this.handleCheckChange(e)}
              checked={this.props.operations[1] ? this.props.operations[1] === 'true' : true}
              data-role="csv-header"
            /> CSV has headers?
          </Label>
        </FormGroup>
        <Popover
          placement="top"
          isOpen={this.state.popoverOpen}
          target=".popover-target"
          toggle={() => this.togglePopover()}
        >
          <PopoverBody>
            <p>
              <span onClick={() => this.togglePopover()} className="inilne-block" data-role="csv-popover">
                  <i className="fa fa-times btn-icon pull-right"/>
              </span>
              CSV should be Array that contains <mark>numbers</mark> separated by <mark>,</mark> sign</p>
            <p>
              Example: <mark>[1,2]</mark>
            </p>
          </PopoverBody>
        </Popover>
      </React.Fragment>
    );
  }
}
