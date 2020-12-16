import React from 'react';
import { connect } from 'react-redux';
import { updateRoute, saveRoute } from 'src/redux/modules/routes';
import { IRoute } from 'src/redux/interfaces/routes';
import ImportFromYaml from './ImportFromYaml';
import _ from 'lodash';
import YAML from 'js-yaml';
import { notify } from 'src/redux/utils/notifications';
import history from 'src/redux/utils/history';
import { Modal, Button } from 'src/components/antd';
const { confirm } = Modal;
import deepReplace from 'deep-replace-in-object' ;
import sortObject from 'deep-sort-object';
import DiffSnippet from 'src/components/atoms/DiffSnippet/DiffSnippet';
import { isInbound } from 'src/redux/utils/routes';
import { pushEvent } from 'src/redux/utils/analytics';

const mapStateToProps = ({ routes }: any) => {
  return {
    routes: routes.list,
  };
}
const mapDispatchToProps = {
  updateRoute,
  saveRoute,
};

interface IImportFromYamlProps {
  routes: IRoute[];
  updateRoute: (route: IRoute, params?: any) => void;
  saveRoute: (route: IRoute, params?: any) => void;
}

const ImportFromYamlContainer: React.FunctionComponent<IImportFromYamlProps> = (props) => {

  async function readFile(e) {
    const files = e.target.files;
    const file = files[0];
    const reader = new FileReader();
    const inputElement = e.target;

    reader.onload = async (event) => {
      try {
        updateRouteList(event.target.result, inputElement);
      } catch (error) {
        inputElement.value = '';
        notify.error(error.message);
      }
    };
    reader.readAsText(file);
  }

  const updateRouteList = (yaml: string, input) => {
    const routeJson = YAML.safeLoad(yaml);
    const routeData = routeJson.data;
    const existingRoutes = props.routes.map(r => _.remove(routeData, { id: r.id })).flat(1);
    existingRoutes.map((r: IRoute, i: number) => showConfirm(r, i, existingRoutes));
    routeData.map((r: IRoute) => saveRouteHandler(r, routeData.length));
    input.value = '';
  };

  async function saveRouteHandler(route: IRoute, length: number) {
    pushEvent('route_import_start', {
      route_type: isInbound(route) ? 'inbound' : 'outbound',
    });
    const isRouteList = length > 1;
    const isRouteWithId = Boolean(route.id || route.attributes.id);
    if (isRouteWithId) {
      await props.updateRoute(route, { hideNotify: true });
      notify.success('Route created successfully');
      if (isRouteList) {
        history.push('/routes');
      } else {
        gotoRoute(route);
      }
    } else {
      props.saveRoute(
        route,
        {
          cb: (routeId: string) => {
            if (isRouteList) {
              history.push('/routes');
            } else {
              gotoRoute(route, routeId);
            };
            pushEvent('route_import_save', {
              route_type: isInbound(route) ? 'inbound' : 'outbound',
            });
          },
          source: route.attributes.tags?.source || 'Yaml',
        },
      );
    }
  }
  async function updateRouteHandler(route: IRoute, openRouteEditor: boolean = true) {
    await props.updateRoute(route);
    pushEvent('route_import_update', {
      route_type: isInbound(route) ? 'inbound' : 'outbound',
    });
    if (openRouteEditor) {
      gotoRoute(route);
    }
  }

  function gotoRoute(route: IRoute, routeId?: string) {
    const routeIdentifier = routeId || route.id || route.attributes.id;
    history.push(`/routes/${routeIdentifier}/edit`);
  }

  function updateAll(routes: IRoute[]) {
    routes.map((route: IRoute) => {
      updateRouteHandler(route, false);
    });
    Modal.destroyAll();
    history.push('/routes');
  }

  function showConfirm(route: IRoute, index: number, routes: IRoute[]) {
    const existingRoute = sortObject(props.routes.find(r => r.id === route.id));
    const orderedRoute = {
      attributes: deepReplace(undefined, null, existingRoute),
      id: `${existingRoute.id}`,
      type: 'rule_chain',
    };
    const length = routes.length;
    confirm({
      className: 'yaml-modal',
      title: (
        <div className="d-flex justify-content-between">
          <h5 className="mb-0">Update existing route {length > 1 && `${length - index} of ${length} routes`}</h5>
          {length > 1 &&
          <Button onClick={() => updateAll(routes)}>Update All</Button>
          }
        </div>
      ),
      width: 1040,
      centered: true,
      maskClosable: true,
      cancelText: length > 1 ? 'Skip' : 'Cancel',
      okText: 'Update',
      content: (
        <div className="json-to-yaml">
          <hr className="mt-0" />
          <span><b>WARNING</b> The route already exists. Are you sure you would like to update:</span>
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
              {route.attributes?.destination_override_endpoint}
            </span>
          </span>
          </div>
          <p className="my-2">The original route will be rewritten with the following configuration:</p>
          <DiffSnippet
            oldCode={YAML.safeDump(orderedRoute)}
            newCode={YAML.safeDump(route)}
            oldTitle="Original"
            newTitle="New"
            splitView={true}
            showDiffOnly={false}
          />
        </div>
      ),
      onOk() {
        updateRouteHandler(route);
      },
    });
  }

  return (
    <ImportFromYaml
      onReadFile={event => readFile(event)}
    />
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportFromYamlContainer);
