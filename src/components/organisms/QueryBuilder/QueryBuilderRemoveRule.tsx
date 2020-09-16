import React from 'react';
import { Button, Icon } from 'src/components/antd';

interface IQueryBuilderRemoveRuleProps {
  handleOnClick: () => void;
}

const QueryBuilderRemoveRule: React.FC<IQueryBuilderRemoveRuleProps> = (props) => {
  return (
    <Button
      type="link"
      className="d-flex query-builder-remove-btn role-remove-rule"
      onClick={props.handleOnClick}
    >
      <Icon
        type="close"
        className="align-self-center text-danger"
        style={{ fontSize: '12px' }}
      />
    </Button>
  );
};

export default QueryBuilderRemoveRule;
