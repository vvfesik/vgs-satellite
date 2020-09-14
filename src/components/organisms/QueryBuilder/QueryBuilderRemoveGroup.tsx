import React from 'react';
import { Button, Icon } from 'src/components/antd';

interface IQueryBuilderRemoveGroupProps {
  handleOnClick: () => void;
}

const QueryBuilderRemoveGroup: React.FC<IQueryBuilderRemoveGroupProps> = (props) => {
  return (
    <Button
      type="danger"
      className="d-flex query-builder-remove-btn role-remove-group"
      onClick={props.handleOnClick}
    >
      <Icon
        type="close"
        className="align-self-center"
        style={{ fontSize: '12px' }}
      />
    </Button>
  );
};

export default QueryBuilderRemoveGroup;
