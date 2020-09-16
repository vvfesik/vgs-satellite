import React from 'react';
import { ruleTokenGenerators } from 'src/data/rules-config';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import { Input } from 'reactstrap';

export const FormatSelector = (props: any) => {
  function handleOnChange(e) {
    props.onChange(e);
  }
  return (
    <React.Fragment>
      <label className="text-muted">
        Format <DocsPopover term="format"/>
      </label>
      <div>
        <Input
          type="select"
          name="formatSelect"
          id="formatSelect"
          value={props.format}
          onChange={e => handleOnChange(e)}
          data-role="rule-entry-format-select"
          className="is-disabled"
        >
          {
            ruleTokenGenerators.map(item =>
            <option value={item.value} key={item.value}>
              {item.title}
            </option>,
            )
          }
        </Input>
      </div>
    </React.Fragment>
  );
};
export default FormatSelector;
