import React from 'react';
import YAML from 'js-yaml';
import { DiffSnippet, Modal, Icon } from '@vgs/elemente';
import { IRoute } from 'src/redux/interfaces/routes';

interface IPromoteRouteMergeModalProps {
  route: IRoute;
  existingRoute: IRoute;
  isVisible: boolean;
  isLoading: boolean;
  handleOk: () => void;
  handleCancel: () => void;
}

const PromoteRouteMergeModal: React.FC<IPromoteRouteMergeModalProps> = (props) => {
  const { route, existingRoute, isVisible, isLoading, handleOk, handleCancel } = props;

  return (
    <Modal
      title={
        <h5 className="mb-0 d-flex align-items-center _400">
          <Icon type="question-circle" className="mr-3" />
          Merge existing route
        </h5>
      }
      className="yaml-modal"
      visible={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1040}
      centered={true}
      maskClosable={true}
      cancelText="Cancel"
      okText="Merge"
      okButtonProps={{ loading: isLoading }}
    >
      {!!route && !!existingRoute && (
        <div className="json-to-yaml">
          <span>
            <b className="mr-2">WARNING</b>
            The route
            {existingRoute.tags?.name ? ` "${existingRoute.tags.name}" ` : ' '}
            already exists. Are you sure you would like to merge changes from Satellite?
          </span>
          <div className="update-route__footer mt-3">
          <span>
            <small className="update-route__footer__small">Route ID</small>
            <span>
              {route.id}
            </span>
          </span>
          <span>
            <small className="update-route__footer__small">Upstream Host</small>
            <span>
              {route.destination_override_endpoint || route.attributes?.destination_override_endpoint}
            </span>
          </span>
          </div>
          <p className="my-2">The original route will be rewritten with the following configuration:</p>
          <DiffSnippet
            oldCode={YAML.safeDump(existingRoute, { skipInvalid: true, sortKeys: true })}
            newCode={YAML.safeDump(route, { skipInvalid: true, sortKeys: true })}
            oldTitle="Original"
            newTitle="New"
            splitView={true}
            showDiffOnly={false}
          />
        </div>
      )}
    </Modal>
  );
};

export default PromoteRouteMergeModal;
