import React from 'react';
import VGSQueryBuilder from './VGSQueryBuilder';

import QueryBuilderCombinators from './QueryBuilderCombinators';
import QueryBuilderValue from './QueryBuilderValue';
import QueryBuilderRemoveRule from './QueryBuilderRemoveRule';
import QueryBuilderRemoveGroup from './QueryBuilderRemoveGroup';

import {
  getOperatorsForField,
  remapRule,
  unmapRule,
} from 'src/redux/utils/query-builder';

import operators from 'src/data/query-builder/operators';
import fields from 'src/data/query-builder/fields';
import combinators from 'src/data/query-builder/combinators';
import translations from 'src/data/query-builder/translations';

export interface IQueryBuilderProps {
  onChange: (rules: any) => void;
  rules: any[];
  isMediaTypeEquals: boolean;
}

const fieldMappings = {
  PathInfo: 'matches',
  ContentType: 'equals',
  Method: 'equals',
  Status: 'equals',
  filePath: 'matches',
};

const QueryBuilder: React.SFC<IQueryBuilderProps> = (props) => {
  const query = remapRule(props.rules);
  const controlElements = {
    valueEditor: QueryBuilderValue,
    combinatorSelector: QueryBuilderCombinators,
    removeRuleAction: QueryBuilderRemoveRule,
    removeGroupAction: QueryBuilderRemoveGroup,
  };
  const controlClassnames = {
    addRule: 'ant-btn btn-outline-accent-dark role-add-rule ml-auto',
    addGroup: 'ant-btn btn-outline-accent-dark role-add-group mx-2',
    fields: 'form-control',
    operators: 'form-control',
    ruleGroup: 'rules-list rules-group-container',
    rule: 'rule-container form-inline',
  };

  return (
    <div className="query-builder vgs-query-builder">
      <VGSQueryBuilder
        fieldMappings={fieldMappings}
        fields={props.defaultFields || fields}
        defaultValue={props.defaultValue}
        defaultOperator={props.defaultOperator}
        query={query}
        combinators={combinators}
        operators={operators}
        controlElements={controlElements}
        controlClassnames={controlClassnames}
        translations={translations}
        onQueryChange={(q) => {
          props.onChange(unmapRule(q));
        }}
        getOperators={field => getOperatorsForField(field, props.isMediaTypeEquals)}
      />
    </div>
  );
};

export default QueryBuilder;
