import * as React from 'react';
import classnames from 'classnames';
import { debounce } from 'lodash';
import { Button as RSButton, ButtonGroup } from 'reactstrap';
import { Button, Icon } from 'src/components/antd';

interface IFlowButtonsProps {
  activePhase: string;
  hasPayload: boolean;
  hideSecureButton: boolean;
  onRuleCreate: () => void;
  onSelectPhase: (phase: string) => void;
  onReplay: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onEditCancel: () => void;
  setPreRouteType: (type: 'inbound' | 'outbound') => void;
  selectedTab: 'general' | 'headers' | 'body';
  isMitmLog: boolean;
  isEditMode: boolean;
}

const FlowButtons: React.FC<IFlowButtonsProps> = (props) => {
  const { activePhase, hasPayload, hideSecureButton, onRuleCreate, onSelectPhase, selectedTab } = props;
  const { onEdit, onEditCancel, isEditMode } = props;

  return (
    <div className='text-center mt-3 mb-2 position-relative'>
      {props.isMitmLog && (isEditMode ? (
        <div className='ant-btn-group d-flex position-absolute left-0'>
          <Button size='small' type='ghost' onClick={onEditCancel}>
            <Icon type='close-square' />
            Cancel
          </Button>
          <Button size='small' type='primary' onClick={onEdit}>
            <Icon type='save' />
            Save
          </Button>
        </div>
      ) : (
        <Button
          size='small'
          type='ghost'
          className='d-flex position-absolute left-0'
          onClick={onEdit}
        >
          <Icon type='edit' />
          Edit
        </Button>
      ))}
      {hasPayload && onRuleCreate && !hideSecureButton && (
        <Button
          type='primary'
          size='small'
          className='d-flex position-absolute right-0'
          onClick={() => {
            props.setPreRouteType('inbound');
            onRuleCreate();
          }}
          disabled={isEditMode}
        >
          <span>Secure this payload</span>
        </Button>
      )}
      {!props.isMitmLog || selectedTab !== 'general' ? (
        <ButtonGroup>
          {['request', 'response'].map((phase) => (
            <RSButton
              key={phase}
              size='sm'
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
      ) : (
        <span>
          <Button
            size='small'
            type='ghost'
            className='mx-1'
            disabled={isEditMode}
            onClick={debounce(props.onReplay, 1000)}
          >
            <Icon type='reload' />
            Replay
          </Button>
          <Button
            size='small'
            type='ghost'
            className='mx-1'
            disabled={isEditMode}
            onClick={debounce(props.onDuplicate, 1000)}
          >
            <Icon type='copy' />
            Duplicate
          </Button>
          <Button
            size='small'
            type='ghost'
            className='mx-1'
            disabled={isEditMode}
            onClick={debounce(props.onDelete, 1000)}
          >
            <Icon type='delete' />
            Delete
          </Button>
        </span>
      )}
      <hr className='my-3 p-0' />
    </div>
  );
};

export default FlowButtons;
