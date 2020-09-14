import React from 'react';
import { Select, message } from 'src/components/antd';
const { Option } = Select;
import isCidr from 'is-cidr';
import isIp from 'is-ip';
import { remove } from 'lodash';

export interface IIpWhitelistingProps {
  sourceEndpoint: string;
  onChange: (sourceEndpoint: string, source: string) => void;
}

const IpWhitelisting: React.FC<IIpWhitelistingProps> = (props) => {
  let sourceEndpoint = props.sourceEndpoint.split(',');

  if (props.sourceEndpoint.length === 0) {
    sourceEndpoint = ['*'];
  }

  function onChangeSourceEndpoint(values: string[]) {
    const validEndpoints = remove(values, v => isCidr(v) || isIp(v));
    const invalidValue = values.filter(v => v !== '*');
    if (invalidValue.length > 0) {
      message.error(`${invalidValue.join(', ')} - IP or CIDR is invalid`);
    }

    if (validEndpoints.length === 0) {
      validEndpoints.push('*');
    }

    props.onChange(validEndpoints.join(), 'source_endpoint');
  }

  return (
    <Select
      mode="tags"
      allowClear={true}
      style={{ width: '100%' }}
      tokenSeparators={[',', ', ']}
      value={sourceEndpoint}
      onChange={(values: string[]) => onChangeSourceEndpoint(values)}
    >
      {sourceEndpoint.map((val: string) => (
        <Option key={val}>{val === '*' ? 'Any IP' : val}</Option>
      ))}
    </Select>
  );
};

export default IpWhitelisting;
