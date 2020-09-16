import React, { useState, useRef } from 'react';
import YAML from 'js-yaml';
import { omit } from 'lodash';
import { Button, Modal, Row, Col, Icon } from 'src/components/antd';
import { IRoute } from 'src/redux/interfaces/routes';
import config from 'src/config/config';
import RouteDeleteConfirmModal from 'src/components/organisms/RouteDeleteConfirmModal/RouteDeleteConfirmModal';
import DiffSnippet from 'src/components/atoms/DiffSnippet/DiffSnippet';
import Route from './Route';
import { hostnameFromUri, isValidHostname } from 'src/redux/utils/utils';
import {
  isMultipleInboundWarning,
  prepareRouteForDiff,
  getRouteDiffOnOpen,
  isPdfValid,
  isInbound,
} from 'src/redux/utils/routes';

export interface IRoutePageProps {
  route: IRoute;
  routes: IRoute[];
  handleCancel: () => void;
  routeSaveHandler: (route: IRoute) => void;
  routeChangeHandler: (route: IRoute) => void;
  routeDeleteHandler: (routeId: string) => void;
}

const RoutePage: React.FC<IRoutePageProps> = (props) => {
  const {
    route,
    handleCancel,
    routes,
    routeSaveHandler,
    routeChangeHandler,
    routeDeleteHandler,
  } = props;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const savedRoute = useRef(route);
  const [routeState, setRouteState] = useState(null);
  const [originalRouteState, setOriginalRoute] = useState(null);
  const [updatedRouteState, setUpdatedRoute] = useState(null);
  const [upstreamChangedState, setUpstreamChangedState] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const showMultipleWarning = isInbound(route) && isMultipleInboundWarning(routes, !route.id);

  const getRouteDiff = () => {
    const { originalRoute, updatedRoute } = prepareRouteForDiff(route, routeState, savedRoute.current);
    if (updatedRoute.upstreams) {
      setUpstreamChangedState(true);
    }
    const sftpWithoutUpstream = omit(updatedRoute, 'upstreams');
    setOriginalRoute(originalRoute);
    setUpdatedRoute(sftpWithoutUpstream);
    return getRouteDiffOnOpen(route, routeState, savedRoute.current);
  };

  const toggleRouteConfirmModal = () => {
    const showDiff = getRouteDiff();
    if (route.id && !showDiff) {
      setShowDiffModal(true);
    } else {
      onRouteSave();
    }
  };

  const isValid = (r: IRoute) => {
    if (getRouteDiffOnOpen(r, routeState, savedRoute.current)) {
      return false;
    }
    if (!isPdfValid(r.entries)) {
      return false;
    }
    if (isInbound(r)) {
      const destOverride = hostnameFromUri(r.destination_override_endpoint);
      return isValidHostname(destOverride);
    } else {
      return true;
    }
  };

  const onRouteSave = () => {
    routeSaveHandler(route);
    const sftpWithoutUpstream = omit(route, 'upstreams');
    setRouteState(sftpWithoutUpstream);
    setUpstreamChangedState(false);
    setShowDiffModal(false);
  };

  return (
    <div data-role="edit-route-form">
      {showMultipleWarning && (
        <div className="alert alert-warning">
          We detected multiple inbound routes configurations. <br />
          It is recommendxed to only have one inbound route. Read more about{' '}
          <a href={config.docsMultipleInbounds} target="_blank">
            configuring multiple inbound routes here
          </a>
          .
        </div>
      )}

      <Route
        route={route}
        onChange={routeChangeHandler}
        routes={routes}
      />

      <Row>
        <Col span={12}>
          {route?.id &&
          <Button
            type="link"
            className="text-muted p-0"
            data-role="edit-route-delete-button"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete route
          </Button>
          }
        </Col>
        <Col span={12}>
          <div className="float-right">
            <Button
              type="link"
              className="text-muted"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              disabled={!isValid(route)}
              type="primary"
              data-role="edit-route-save-button"
              onClick={toggleRouteConfirmModal}
            >
              Save
            </Button>
          </div>
        </Col>
      </Row>
      <RouteDeleteConfirmModal
        isLoading={false}
        isModalOpen={isDeleteModalOpen}
        toggleModal={(isOpen: boolean) => setIsDeleteModalOpen(isOpen)}
        routeDeleteHandler={routeDeleteHandler}
        route={route}
      />
      <Modal
        title={'Do you want to apply your changes?'}
        visible={showDiffModal}
        closable={false}
        onOk={onRouteSave}
        onCancel={() => setShowDiffModal(false)}
        okText={'Apply'}
        okButtonProps={{ 'data-role': 'apply-route-changes' }}
        className="json-to-yaml"
        width={1040}
      >
        {upstreamChangedState &&
        <>
          <b>Upstream configuration</b>
          <div className="d-flex mb-2">
            <Icon
              type="warning"
              theme="filled"
              className="align-self-center mr-2 text-warning"
              style={{ fontSize: '18px' }}
            />
            &nbsp;Upstreams configurations have been updated
          </div>
        </>
        }
        <>
          <b>Route configuration</b>
          <DiffSnippet
            oldCode={YAML.safeDump(originalRouteState, { skipInvalid: true, sortKeys: true })}
            newCode={YAML.safeDump(updatedRouteState, { skipInvalid: true, sortKeys: true })}
            splitView={true}
          />
        </>
      </Modal>
    </div>
  );
};

export default RoutePage;
