import React from 'react';
import { Label, Popover, PopoverBody } from 'reactstrap';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import StringsArray from 'src/components/atoms/StringsArray/StringsArray';
import { ITransformerProps, ITransformerState } from '.';

export class FormData extends React.Component<ITransformerProps, ITransformerState> {
  state = {
    popoverOpen: false,
  };

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  }

  parseQueryString(queryString: string) {
    const hashes = queryString.slice(queryString.indexOf('?') + 1).split('&');
    const params = {};
    hashes.map((hash) => {
      const [key, val] = hash.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(val);
    });

    return params;
  }

  isValid (value: string) {
    if (!value) {
      return true;
    }

    try {
      this.parseQueryString(value);
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
        <Label className="text-muted mr-sm-2 popover-target">
          Fields in FormData
          <DocsPopover hint={
            <div>
              <p>application/x-www-form-urlencoded data</p>
              <p>
                Example: <mark>cvv_code</mark>
              </p>
            </div>
          } />
        </Label>
        <StringsArray
          values={this.props.operations}
          onChange={(ops: string[]) => this.onChange(ops)}
          validator={value => this.isValid(value)}
          placeholder="account-number"
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
              Invalid <mark>FormData</mark> value
            </p>
            <p>
              Example: <mark>ssn</mark>
            </p>
            <a href="https://tools.ietf.org/html/rfc2388" target="_blank">FormData documentation</a>
          </PopoverBody>
        </Popover>
      </React.Fragment>
    );
  }
}
