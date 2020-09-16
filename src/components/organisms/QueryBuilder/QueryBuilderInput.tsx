import React from 'react';
import { removeQueryParameters } from 'src/redux/utils/utils';

import { IQueryBuilderValueProps } from './QueryBuilderValue';

const QueryBuilderInput: React.SFC<IQueryBuilderValueProps> = (props) => {
  const { operator, value, handleOnChange } = props;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const onChange = (path: string) => {
    const trimmedPath = removeQueryParameters(path);
    handleOnChange(trimmedPath);
  };

  return (
    <input
      type="text"
      data-role="query-builder-input"
      className="form-control mr-2 flex-grow-1"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default QueryBuilderInput;
