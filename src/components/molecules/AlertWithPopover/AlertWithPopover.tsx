import React from 'react';
import { Alert, Icon, Popover } from 'src/components/antd';
import classNames from 'classnames';

export interface IOutboundHostsProps {
  message: string;
  bordersStyle: string;
  showIcon: boolean;
}

const AlertWithPopover: React.FC<IOutboundHostsProps> = (props) => {

  const content = (
    <div>
      <p className="m-0">
        <a href="https://www.verygoodsecurity.com/docs/guides/managing-your-routes#ip-whitelisting" target="_blank">
          IP Whitelisting
        </a>
        &nbsp;allows you to explicitly restrict access to<br/>
        specific IP addresses and/or CIDR notations for APIs.
      </p>
    </div>
  );
  const description = (
    <Popover
      content={content}
      trigger="hover"
      placement="topRight"
      arrowPointAtCenter
    >
      <Icon
        type="question-circle"
        theme="filled"
        data-role="question-circle"
        className="ml-2 align-self-center text-secondary"
        style={{ fontSize: '14px' }}
      />
    </Popover>
  );
  return (
    <Alert
      showIcon={props.showIcon}
      message={props.message}
      className={classNames(props.bordersStyle, 'd-flex alert-with-popover')}
      description={description}
      banner
    />
  );
};

export default AlertWithPopover;
