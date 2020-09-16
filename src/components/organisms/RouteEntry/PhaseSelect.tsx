import React from 'react';
import { Input } from 'reactstrap';

export const PhaseSelect = (props: any) => {
  return (
    <Input
      type="select"
      name="phaseSelect"
      id="phaseSelect"
      value={props.phase}
      onChange={props.onChange}
      data-role="rule-entry-phase-select"
    >
      <option value="REQUEST">{props.requestLabel}</option>
      <option value="RESPONSE">{props.responseLabel}</option>
    </Input>
  );
};

export default PhaseSelect;
