import React from 'react';
import { ILogRoutes } from 'src/redux/interfaces/logs';

const RoutesLabel: React.SFC<{routes: ILogRoutes}> = (props) => {
  return (
    <span>
      {props.routes.data.length}
    </span>
  );
};

export default RoutesLabel;
