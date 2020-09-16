import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';

export interface IOperationsSelectProps {
  onChange: (op: string) => void;
  currentOperation: string;
}

const OperationsSelect: React.SFC<IOperationsSelectProps> = (props) => {
  const { onChange, currentOperation } = props;

  return (
    <>
      <ButtonGroup>
        <Button
          className={`btn-light ${currentOperation === 'REDACT' ? 'active' : null}`}
          onClick={() => onChange('REDACT')}
        >
          REDACT
        </Button>
        <Button
          className={`btn-light ${currentOperation === 'ENRICH' ? 'active' : null}`}
          onClick={() => onChange('ENRICH')}
        >
          REVEAL
        </Button>
      </ButtonGroup>
    </>
  );
};

export default OperationsSelect;
