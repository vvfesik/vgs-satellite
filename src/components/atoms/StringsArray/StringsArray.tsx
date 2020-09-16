import React from 'react';
import { Input, Label, Button, ButtonGroup } from 'reactstrap';

export interface IStringsArrayProps {
  values: string[];
  onChange: (values: string[]) => void;
  validator: (value: string) => boolean;
  placeholder: string;
}

class StringsArray extends React.Component<IStringsArrayProps> {
  onChangeValue(value: string, i: number) {
    const values = [...this.props.values];
    values[i] = value;

    this.props.onChange(values);
  }

  removeValue(index: number) {
    let values = [...this.props.values];
    if (values.length === 1) {
      values[0] = '';
    } else {
      values = values.filter((o, i) => i !== index);
    }

    this.props.onChange(values);
  }

  addValue() {
    this.props.onChange([...this.props.values, '']);
  }

  render () {
    return (
      <React.Fragment>
        {
          this.props.values && this.props.values.map((operation, i) => (
            <div key={i} className="mb-1 row no-gutters">
              <Label className="col-sm-1 col-form-label col-form-label-sm operation-label">{i + 1}</Label>
              <ButtonGroup className="col-sm-11 operation-input">
                <Input
                  type="text"
                  name="text"
                  placeholder={this.props.placeholder}
                  data-role="operation-field-input"
                  className={`${this.props.validator(operation) ? '' : 'is-invalid'}`}
                  value={operation}
                  onChange={e => this.onChangeValue(e.target.value, i)}
                />
                <Button
                  className="btn-light"
                  data-role="remove-operation-field-btn"
                  onClick={() => this.removeValue(i)}
                >
                  x
                </Button>
              </ButtonGroup>
            </div>
          ))
        }

        <div className="strings-array">
          <div className="row no-gutters">
            <label htmlFor="colFormLabelSm" className="col-sm-1 col-form-label-sm">
              {this.props.values && this.props.values.length + 1}
            </label>
            <div
              data-role="add-operation-field-btn"
              className="col-11 strings-array-add-button"
              onClick={(e) => { e.preventDefault(); this.addValue(); }}
            >
              <i className="fa fa-plus"/>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default StringsArray;
