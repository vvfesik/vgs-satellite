import React from 'react';
import classNames from 'classnames';
import { Button } from 'src/components/antd';

interface IQueryBuilderCombinator {
  label: string;
  name: string;
}

interface IQueryBuilderCombinatorsProps {
  options: IQueryBuilderCombinator[];
  value: string;
  handleOnChange: (combinator: string) => void;
}

const QueryBuilderCombinators: React.SFC<IQueryBuilderCombinatorsProps> = (props) => {
  const { options, value } = props;

  return (
    <div className="ant-btn-group btn-group">
      {options.map(op => (
        <Button
          key={op.name}
          type="primary-up-2"
          className={classNames({ active: op.name === value })}
          onClick={() => props.handleOnChange(op.name)}
        >
          {op.label}
        </Button>
      ))}
    </div>
  );
};

export default QueryBuilderCombinators;
