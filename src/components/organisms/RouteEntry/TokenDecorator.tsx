import React from 'react';
import { Label } from 'reactstrap';
import { Input, Button, Badge } from 'src/components/antd';

interface ITokenDecoratorProps {
  onChange: (values: any) => void;
  pattern: any;
}

const TokenDecorator: React.FC<ITokenDecoratorProps> = (props) => {

  const onChangeNonLuhnPattern = (nonLuhnPattern: string) => {
    const tokenDecorator = {
      ...props.pattern,
      tokenDecorator: {
        ...props.pattern.tokenDecorator,
        nonLuhnPattern,
      },
    };
    props.onChange(tokenDecorator);
  };

  const onChangePatternList = (target: any, i: number) => {
    const values = [...props.pattern.tokenDecorator.patternsList];
    values[i][`${target.name}`] = target.value;

    const tokenDecorator = {
      ...props.pattern,
      tokenDecorator: {
        ...props.pattern.tokenDecorator,
        patternsList: [...values],
      },
    };

    props.onChange(tokenDecorator);
  };

  const removeValue = (index: number) => {
    let patternsList = [...props.pattern.tokenDecorator.patternsList];
    if (patternsList.length === 1) {
      patternsList[0] = { searchPattern: '', replacePattern: '' };
    } else {
      patternsList = patternsList.filter((o, i) => i !== index);
    }

    const tokenDecorator = {
      ...props.pattern,
      tokenDecorator: {
        ...props.pattern.tokenDecorator,
        patternsList,
      },
    };

    props.onChange(tokenDecorator);
  };

  const addValue = () => {
    const tokenDecorator = {
      ...props.pattern,
      tokenDecorator: {
        ...props.pattern.tokenDecorator,
        patternsList: [...props.pattern.tokenDecorator.patternsList, { searchPattern: '', replacePattern: '' }],
      },
    };
    props.onChange(tokenDecorator);
  };

  return (
    <div>
      <Label className="text-muted mr-sm-2 popover-target">
        Non Luhn Pattern
      </Label>
      <div className="mb-3 row no-gutters">
        <Input
          type="text"
          name="text"
          placeholder="Non Luhn Pattern"
          value={props.pattern?.tokenDecorator?.nonLuhnPattern}
          onChange={e => onChangeNonLuhnPattern(e.target.value)}
        />
      </div>
      {props.pattern?.tokenDecorator?.patternsList && props.pattern.tokenDecorator.patternsList.map((pattern, i) => (
        <div key={i} className="mb-1 row no-gutters border rounded p-3">
          <div className="d-flex ant-row-flex-space-between w-100">
            <Badge
              count={i + 1}
              style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }}
            />
            {i > 0 &&
              < Button
                ghost
                className="d-flex"
                color="dark"
                icon="close"
                onClick={() => removeValue(i)}
              />
            }
          </div>
          <div className="">
            <Label className="text-muted mr-sm-2 popover-target">Search Pattern</Label>
            <Input
              type="text"
              name="searchPattern"
              placeholder="Search Pattern"
              value={pattern.searchPattern}
              onChange={e => onChangePatternList(e.target, i)}
            />
            <Label className="text-muted mr-sm-2 popover-target">Replace Pattern</Label>
            <Input
              type="text"
              name="replacePattern"
              placeholder="Replace Pattern"
              value={pattern.replacePattern}
              onChange={e => onChangePatternList(e.target, i)}
            />
          </div>
        </div>
        ))
      }
      <div className="strings-array">
        <div className="row no-gutters">
          <label htmlFor="colFormLabelSm" className="col-sm-1 col-form-label-sm">
            {props.pattern?.tokenDecorator?.patternsList.length + 1}
          </label>
          <div
            className="col-11 strings-array-add-button"
            onClick={(e) => { e.preventDefault(); addValue(); }}
          >
            <i className="fa fa-plus"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDecorator;
