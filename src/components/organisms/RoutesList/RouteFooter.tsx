import React from 'react';
import Icon from 'src/components/atoms/Icon/Icon';
import { IRoute } from 'src/redux/interfaces/routes';
import { UncontrolledCollapse } from 'reactstrap';
import { uniqueId } from 'lodash';
import RouteEntryInfo from 'src/components/organisms/RouteEntry/RouteEntryInfo';
import { isInbound } from 'src/redux/utils/routes';
import { pushEvent } from 'src/redux/utils/analytics';

export interface IRouteFooterProps {
  route: IRoute;
}

export const RouteFooter = (props: IRouteFooterProps) => {
  const { route } = props;
  const routeId = uniqueId('route-');

  const toggleCollapse = () => {
    pushEvent('route_filter_expand', {
      route_type: isInbound(route) ? 'inbound' : 'outbound',
    });
  };

  return (
    <>
      {route.entries.length ?
        <>
          <div
            className="row no-gutters justify-content-between filter-toggler"
            id={routeId}
            onClick={toggleCollapse}
          >
            <span className="align-middle">
              <Icon type="accent" name="check" position="left" />
              Filters
            </span>
            <Icon type="primary-light" name="chevron-down"/>
          </div>
          <UncontrolledCollapse toggler={routeId}>
            <RouteEntryInfo route={route} />
          </UncontrolledCollapse>
        </>
        :
        <div className="row no-gutters">
          <span className="align-middle">
            <Icon type="danger" name="exclamation-circle" position="left" />
            No Filters
          </span>
        </div>
      }
    </>
  );
};

export default RouteFooter;
