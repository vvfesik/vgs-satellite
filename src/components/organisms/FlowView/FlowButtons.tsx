import * as React from 'react';
import classnames from 'classnames';
import { Button as RSButton, ButtonGroup } from 'reactstrap';
import { Button } from 'src/components/antd';

interface IFlowButtonsProps {
  activePhase: string;
  hasPayload: boolean;
  hideSecureButton: boolean;
  onRuleCreate: () => void;
  onSelectPhase: (phase: string) => void;
  setPreRouteType: (type: 'inbound' | 'outbound') => void;
}

const FlowButtons: React.SFC<IFlowButtonsProps> = (props) => {
  const { activePhase, hasPayload, hideSecureButton, onRuleCreate, onSelectPhase } = props;

  return (
    <div className="text-center mt-3 mb-2 position-relative">
      {hasPayload && onRuleCreate && !hideSecureButton && (
        <Button
          type="primary"
          size="small"
          className="d-flex position-absolute right-0"
          onClick={() => {
            props.setPreRouteType('inbound');
            onRuleCreate();
          }}
        >
          <span>Secure this payload</span>
        </Button>
      )}
      <ButtonGroup>
        {['request', 'response'].map(phase => (
          <RSButton
            key={phase}
            size="sm"
            color={phase === activePhase ? 'primary-light' : 'outline'}
            className={classnames(
              { active: phase === activePhase },
              'capitalize',
            )}
            data-role={`select-${phase}-phase`}
            onClick={() => onSelectPhase(phase)}
          >
            {phase}
          </RSButton>
        ))}
      </ButtonGroup>
      <hr className="my-3 p-0" />
    </div>
  );
};

export default FlowButtons;
