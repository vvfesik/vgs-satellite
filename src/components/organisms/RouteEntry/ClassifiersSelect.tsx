import React, { FC } from 'react';
import { Select } from 'src/components/antd';
import classifiersList from './classifiers-list';
const { Option } = Select;

interface IClassifiersSelectProps {
  value: string;
  placeholder: string;
  onChange: (tags: string) => void;
  mode?: 'tags' | 'multiple';
}

const ClassifiersSelect: FC<IClassifiersSelectProps> = ({ value, onChange, placeholder, mode = 'multiple' }) => {
  return (
    <Select
      mode={mode}
      style={{ width: '100%' }}
      placeholder={placeholder}
      value={value ? value.split(',') : []}
      onChange={(selectedValues: string[]) => onChange(selectedValues.join(','))}
    >
      {classifiersList.map((val: string) => (
        <Option key={val}>{val}</Option>
      ))}
    </Select>
  );
};

export default ClassifiersSelect;
