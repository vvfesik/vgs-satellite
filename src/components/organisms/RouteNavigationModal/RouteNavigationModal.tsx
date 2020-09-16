import React from 'react';
import NavigationPrompt from 'react-router-navigation-prompt';
import { Modal } from 'src/components/antd';
import { IEntry, IRoute } from 'src/redux/interfaces/routes';

export interface IRouteNavigationModalProps {
  route: IRoute;
  title: string;
  content: string;
}

const RouteNavigationModal: React.SFC<IRouteNavigationModalProps> = (props) => {
  const { route, title, content } = props;

  const checkUsavedRoute = (entries: IEntry[]) => {
    return entries.some(entry => entry.removing === true);
  };

  return (
    <NavigationPrompt when={checkUsavedRoute(route.entries)}>
      {({ onConfirm, onCancel }) => (
        <Modal
          title={title}
          visible={true}
          closable={false}
          onOk={onConfirm}
          onCancel={onCancel}
        >
          <p>{content}</p>
        </Modal>
      )}
    </NavigationPrompt>
  );
};

export default RouteNavigationModal;
