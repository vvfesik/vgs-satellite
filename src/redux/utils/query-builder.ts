import _ from 'lodash';
import operators from 'src/data/query-builder/operators';
import fields, { sftpFields } from 'src/data/query-builder/fields';

export function getOperatorsForField(field: any, isMediaTypeEquals?: boolean) {
  if (!field) return fields;

  const fieldConfig: any = fields.find(f => f.name === field) || sftpFields.find(f => f.name === field);

  if (fieldConfig && isMediaTypeEquals) {
    return operators.filter(op => op.types.some(type => fieldConfig.type.includes(type)));
  } else if (fieldConfig && !isMediaTypeEquals) {
    return operators.filter(op => op.types.some(type => fieldConfig.type.includes(type) && !op.types.includes('media_type')));
  } else {
    return [operators[0]];
  }
}

export function remapRule(rule: any) {
  const query = _.cloneDeep(rule);

  if (query.condition) {
    query.combinator = query.condition;
  }
  if (query.id) {
    query.field = query.id;
  }
  if (query.rules) {
    query.rules = query.rules.map(remapRule);
  }
  query.id = _.uniqueId('qb-');

  delete query.condition;
  return query;
}

export function unmapRule(rule: any) {
  const query = _.cloneDeep(rule);
  query.condition = query.combinator;

  if (query.field) {
    query.expression = {
      field: query.field,
      type: 'string',
      operator: query.operator,
      values: [query.value],
    };
  }

  delete query.id;
  delete query.combinator;
  delete query.field;
  delete query.type;
  delete query.operator;
  delete query.value;

  if (query.rules) {
    query.rules = query.rules.map(unmapRule);
  }

  return query;
}

// TODO: remove this function and refactor remapRule/unmapRule
export function convertRules(queryConfig: any) {
  return {
    condition: queryConfig.condition,
    rules: queryConfig.rules ? queryConfig.rules.map((rule: any) => {
      const expression = rule.expression || {};

      if (rule.rules && rule.rules.length) {
        return convertRules(rule);
      } else {
        return {
          id: expression.field,
          operator: expression.operator,
          type: expression.type,
          value: _.isArray(expression.values) ? expression.values[0] : expression.values,
        };
      }
    })
    : [],
  };
}
