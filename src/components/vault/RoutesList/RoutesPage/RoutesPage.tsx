import React, { useState } from 'react';
import RoutesList from 'src/components/organisms/RoutesList/RoutesList';
import RouteDeleteConfirmModal from 'src/components/organisms/RouteDeleteConfirmModal/RouteDeleteConfirmModal';
import RoutesPageHeader from './RoutesPageHeader';
import { groupBy } from 'lodash';
import { IRoute, TRouteType } from 'src/redux/interfaces/routes';
import { isInbound, getProxyType } from 'src/redux/utils/routes';
import { pushEvent } from 'src/redux/utils/analytics';
import { TabContent, TabPane } from 'reactstrap';

export interface IRoutesPageProps {
  routes: IRoute[];
  isLoading: boolean;
  deleteRoute: (routeId: string) => void;
}

function groupRoutes(list: IRoute[]): {Forward: IRoute[], Reverse: IRoute[]} {
  return groupBy(list, route => getProxyType(route));
}

const RoutesPage: React.FC<IRoutesPageProps> = (props) => {
  const grouppedRoutes = groupRoutes(props.routes);
  const [activeTab, setActiveTab] = useState('all-routes');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<IRoute | undefined>();

  const handleDeleteRoute = (route: IRoute) => {
    setCurrentRoute(route);
    setIsDeleteModalOpen(true);
  }

  const handleDeleteRouteById = (routeId: string) => {
    if (currentRoute) {
      pushEvent('route_delete', {
        route_type: isInbound(currentRoute) ? 'inbound' : 'outbound',
      });
    }
    props.deleteRoute(routeId);
    setIsDeleteModalOpen(false);
    setCurrentRoute(undefined);
  }

  const handleSetActiveTab = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'all-routes') {
      pushEvent('route_all_tab');
    } else {
      pushEvent(`route_${tabId}_tab`);
    }
  };

  function renderList(list: IRoute[], routeType: TRouteType) {
    return list ? (
      <div data-role={`routes-list-${routeType.toLowerCase()}`}>
        <RoutesList list={list} deleteRoute={(route: IRoute) => handleDeleteRoute(route)} />
      </div>)
      :
      <p className="text-center no-routes-message pt-4 pb-4">No {routeType} routes!</p>;
  }

  return (
    <div data-role="routes-container">
      <RoutesPageHeader
        hasRoutes={!!props.routes?.length}
        activeTab={activeTab}
        setActiveTab={(tabId: string) => handleSetActiveTab(tabId)}
      />
      {!!props.routes?.length && (
        <TabContent className='mt-4' activeTab={activeTab}>
          <TabPane tabId='all-routes'>
            <h4>Inbound</h4>
            {renderList(grouppedRoutes.Reverse, 'Inbound')}
            <h4>Outbound</h4>
            {renderList(grouppedRoutes.Forward, 'Outbound')}
          </TabPane>
          <TabPane tabId='inbound'>
            {renderList(grouppedRoutes.Reverse, 'Inbound')}
          </TabPane>
          <TabPane tabId='outbound'>
            {renderList(grouppedRoutes.Forward, 'Outbound')}
          </TabPane>
        </TabContent>
      )}
      {!!currentRoute && (
        <RouteDeleteConfirmModal
          isLoading={false}
          isModalOpen={isDeleteModalOpen}
          toggleModal={(isOpen: boolean) => setIsDeleteModalOpen(isOpen)}
          routeDeleteHandler={handleDeleteRouteById}
          route={currentRoute}
        />
      )}
    </div>
  );
};

export default RoutesPage;
