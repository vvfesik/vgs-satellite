import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import RouteContainer from './RouteContainer';
import { getRouteFromTemplate } from 'src/redux/modules/routes';
import { pushEvent } from 'src/redux/utils/analytics';

type TRouteType = 'inbound' | 'outbound';

export interface INewRouteContainerProps {
  routeType: TRouteType;
  getRouteFromTemplate: (routeType: TRouteType) => void;
}

const mapDispatchToProps = {
  getRouteFromTemplate,
};

const NewRouteContainer: React.FC<INewRouteContainerProps> = (props) => {
  useEffect(() => {
    props.getRouteFromTemplate(props.routeType);
    pushEvent('route_add', { route_type: props.routeType });
  }, []);

  return <RouteContainer />;
};

export default connect(null, mapDispatchToProps)(NewRouteContainer);
