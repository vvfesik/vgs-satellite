import React, { useState, useEffect } from 'react';
import Code from 'src/components/atoms/Code/Code';
import DownloadBtn from 'src/components/atoms/DownloadBtn/DownloadBtn';
import { IVault } from 'src/redux/interfaces/vault';
import { IRoute } from 'src/redux/interfaces/routes';
import * as JSYAML from 'js-yaml';
import deepReplace from 'deep-replace-in-object';
import sortObject from 'deep-sort-object';
import { Button, Icon, Modal, Popover } from 'src/components/antd';
import { TabPane, TabContent, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import config from 'src/config/config';
import { isInbound } from 'src/redux/utils/routes';
import { pushEvent } from 'src/redux/utils/analytics';

interface IYamlProps {
  route: IRoute[] | IRoute;
  routes: any;
  currentVault: IVault;
  isExternal?: boolean;
  setExternalToggle?: (open: boolean) => void;
  isExternalOpen?: boolean;
  handleSaveRoute: (route: IRoute) => void;
  proxyMode?: string;
}

const Yaml: React.FC<IYamlProps> = (props) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [routeYamlStr, setRouteYamlStr] = useState('');
  const isRouteEditor = Boolean(props.route?.id);

  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('inbound');

  useEffect(() => {
    if (props.isExternalOpen) {
      getRouteYamlStr(props.routes[props.proxyMode ? routeType : activeTab]);
    }
  },        [props.isExternalOpen, props.proxyMode]);

  const routeType = props.proxyMode === 'regular' ? 'outbound' : 'inbound';

  const getRouteYamlStr = (routes: IRoute[] | IRoute) => {
    const routesList = Array.isArray(routes) ? routes : [routes];
    const orderedArray = routesList.map((route: IRoute) => sortObject(route));
    const routeJsonWrapper = {
      data: orderedArray.map((route: IRoute) => ({
        attributes: deepReplace(undefined, null, route.attributes || route),
        id: route.id || null,
        type: 'rule_chain',
      })),
      version: 1,
    };
    setRouteYamlStr(JSYAML.safeDump(routeJsonWrapper, { schema: JSYAML.CORE_SCHEMA }));
  };

  const openModal = (event: any) => {
    event.preventDefault();
    setIsOpenModal(true);
    getRouteYamlStr(props.route || props.routes.inbound);
  };
  
  const saveRoute = () => {
    props.handleSaveRoute(props.routes[props.proxyMode ? routeType : activeTab]);
  };

  const tabs = [
    { name: 'inbound', label: 'Inbound', syntax: 'yaml' },
    { name: 'outbound', label: 'Outbound', syntax: 'yaml' },
  ];

  const tabList = (tabs) => {
    return tabs.map(tab => (
      <NavItem key={tab.name}>
        <NavLink
          className={classnames({ active: activeTab === tab.name }, 'cursor-pointer')}
          onClick={() => { setActiveTab(tab.name); getRouteYamlStr(props.routes[tab.name]); }}
        >
          {tab.label}
        </NavLink>
      </NavItem>
    ));
  };

  const onExport = (tabLabel?: string) => {
    if (tabLabel) {
      pushEvent('route_export', {
        route_type: tabLabel.toLowerCase(),
      });
    } else if (!Array.isArray(props.route)) {
      pushEvent('route_export', {
        route_type: isInbound(props.route) ? 'inbound' : 'outbound',
      });
    }
  };

  const tabContent = (tabs) => {
    return tabs.map(tab => (
      <TabPane tabId={tab.name} key={tab.name}>
        <div
          style={{ maxHeight: '21rem', overflow: 'auto', marginTop: '0.5rem', borderRadius: '0.5rem' }}
          data-role={`${tab.name}-code-container`}
        >
          <Code language={tab.syntax} numbers={false} className="my-0">
            {routeYamlStr}
          </Code>
        </div>
        <div className="text-center mt-3">
          <DownloadBtn
            fileName={`${tab.name}-configuration.yaml`}
            className="json-to-yaml__download ant-btn-ghost"
            text={routeYamlStr}
            eventAction="Route has been downloaded"
            category="ROUTES"
            eventLabel="User downloaded a route"
            buttonName={`Export ${tab.label} YAML`}
            callback={() => onExport(tab.label)}
          />
          {!props.route && (
            <Button type='primary' onClick={saveRoute} className='ml-3'>
              <Icon type='save' />
              Save {tab.label} route
            </Button>
          )}
        </div>
      </TabPane>
    ));
  };

  const links = {
    dashboard: config.dashboardLink,
    docsYamlImport: config.docsYamlImportLink,
    docsVGSCLI: config.docsVGSCLILink,
    docsTermRoute: config.docsTermRouteLink,
  };
  const externalLink = (name: string, title: string) => <a href={links[name]} target="_blank">{title}</a>;

  return (
    <div className="json-to-yaml">
      {!props.isExternal && (
        <Button
          type={isRouteEditor ? "secondary" : "link"}
          size={isRouteEditor ? "small" : "default"}
          onClick={(event: any) => openModal(event)}
          className={isRouteEditor ? 'pull-right' : 'dropdown-item p-0 text-text'}
        >
          {isRouteEditor ?
            <>
              <Icon type="file" />
              <span className="ml-2">Export YAML</span>
            </>
            : <span>All as YAML</span>
          }
        </Button>
      )}
      <Modal
        visible={isOpenModal || props.isExternalOpen}
        footer={null}
        onCancel={() =>
          props.isExternalOpen
            ? props.setExternalToggle(false)
            : setIsOpenModal(false)
        }
        className="json-to-yaml"
        width={800}
        title={<h5 className="mb-0">Save route</h5>}
        closable={false}
      >
        {props.route ? (
          <TabContent activeTab={'route'}>
            {tabContent([{ name: 'route', label: '', syntax: 'yaml' }])}
          </TabContent>
        ) : (
          <div className="ta-left">
            {!props.proxyMode && (
              <Nav tabs>
                {tabList(tabs)}
                <div className="cursor-pointer position-absolute right mr-4 mt-2">
                  <Popover
                    content={(
                      <span className="text-sm d-inline-block">
                        Normally you will need only one route to set up either
                        <br />
                        <strong>inbound connection </strong>
                        (Your Client ﹤﹥ VGS ﹤﹥ Your Server)
                        <br />
                        or <strong>outbound connection </strong>
                        (Your Server ﹤﹥ VGS ﹤﹥ Third party).
                        <br />
                        {externalLink('docsTermRoute', 'Read more')}
                      </span>
                    )}
                    trigger="hover"
                  >
                    <Icon
                      type="question-circle"
                      theme="filled"
                      className="ml-2 align-self-center text-secondary"
                      style={{ fontSize: '14px' }}
                    />
                  </Popover>
                </div>
              </Nav>
            )}
            {props.proxyMode ? (
              <TabContent activeTab={routeType}>
                {tabContent([tabs.find(tab => tab.name === routeType)])}
              </TabContent>
            ) : (
              <TabContent activeTab={activeTab}>
                {tabContent(tabs)}
              </TabContent>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Yaml;
