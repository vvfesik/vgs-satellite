import React from 'react';
import { ILog } from 'src/redux/interfaces/logs';

const ROUTE_TYPES = {
  reverse: 'inbound',
  forward: 'outbound',
};

const RouteTypeLabel: React.SFC<{type: ILog['route_type']}> = (props) => {
  return (
    <span>{ROUTE_TYPES[props.type]}</span>
  );
};

export default RouteTypeLabel;
