import React from 'react';
import { Modal } from 'src/components/antd';

export interface IRouteConfirmModalProps {
  title: string;
  content: string;
  okText: string;
  showModal: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const RouteConfirmModal: React.SFC<IRouteConfirmModalProps> = (props) => {
  const { title, content, okText, showModal,  onOk, onCancel } = props;

  return (
    <Modal
      title={title}
      visible={showModal}
      closable={false}
      onOk={() => onOk()}
      onCancel={() => onCancel()}
      okText={okText}
    >
      <p>{content}</p>
    </Modal>
  );
};

export default RouteConfirmModal;
