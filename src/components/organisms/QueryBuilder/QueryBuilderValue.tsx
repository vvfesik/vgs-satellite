import React from 'react';

import QueryBuilderSelect from './QueryBuilderSelect';
import QueryBuilderInput from './QueryBuilderInput';
import fields, { sftpFields } from 'src/data/query-builder/fields';

export interface IQueryBuilderValueProps {
  handleOnChange: (value: string) => void;
  value: string;
  operator: string;
  field: string;
}

const QueryBuilderValue: React.SFC<IQueryBuilderValueProps> = (props) => {
  const { operator, field } = props;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const fieldConfig: any = fields.find(f => f.name === field) || sftpFields.find(f => f.name === field);

  if (!fieldConfig) return null;

  return (
    fieldConfig.values
    ? <QueryBuilderSelect values={fieldConfig.values} {...props} />
    : <QueryBuilderInput {...props} />
  );
};

export default QueryBuilderValue;
