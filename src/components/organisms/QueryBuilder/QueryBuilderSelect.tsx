import React from 'react';
import { IQueryBuilderValueProps } from './QueryBuilderValue';
import CreatableSelect from 'react-select/creatable';

interface IQueryBuilderSelectProps extends IQueryBuilderValueProps {
  values: any[];
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 32,
    height: 32,
    fontSize: 14,
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    minHeight: 32,
    height: 32,
    paddingTop: 4,
    paddingBottom: 4,
  }),
  valueContainer: (base: any) => ({
    ...base,
    minHeight: 32,
    height: 32,
    fontSize: 14,
  }),
  menuList: (base: any) => ({
    ...base,
    fontSize: 14,
  }),
};

const QueryBuilderSelect: React.SFC<IQueryBuilderSelectProps> = (props) => {
  const { operator, value, handleOnChange, values } = props;

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const renderValues = [...values];
  if (!renderValues.includes(value)) {
    renderValues.push({ value, label: value });
  }
  const selected = renderValues.find((f: any) => f.value === value);
  return (
    <div className="flex-grow-1 mr-2">
      <CreatableSelect
        className="query-builder-select-container"
        options={renderValues}
        value={selected}
        styles={selectStyles}
        onChange={f => handleOnChange(f.value)}
      />
    </div>
  );
};

export default QueryBuilderSelect;
