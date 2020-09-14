import QBuilder from 'react-querybuilder';
import { uniqueId } from 'lodash';

export default class extends QBuilder {
  createRule() {
    const { fields, operators } = this.state.schema;
    const { defaultValue, defaultOperator } = this.props;
    return {
      id: `r-${uniqueId()}`,
      field: fields[0].name,
      value: defaultValue,
      operator: defaultOperator || operators[0].name,
    };
  }
  createRuleGroup() {
    return {
      id: `g-${uniqueId()}`,
      rules: [this.createRule()],
      combinator: 'AND',
    };
  }
}
