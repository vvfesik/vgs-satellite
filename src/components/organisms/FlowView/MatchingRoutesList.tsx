import * as React from 'react';
import MatchingRoute from './MatchingRoute';
import { IRoute } from 'src/redux/interfaces/routes';
import { ILogRoute, ILogOperation } from 'src/redux/interfaces/logs';

interface IMatchingRoutesListProps {
  matchingRoutes: IRoute[];
  logRoutes: ILogRoute[];
  logRouteType: string;
  hasFilters: boolean;
  matchingFilters: string[];
  matchingOperations: ILogOperation[];
  outdated: boolean;
  activePhase: string;
}

const MatchingRoutesList: React.FC<IMatchingRoutesListProps> = (props) => {
  const {
    matchingRoutes,
    logRoutes,
    logRouteType,
    hasFilters,
    matchingFilters,
    matchingOperations,
    outdated,
    activePhase,
  } = props;
  const route = (id: string) => matchingRoutes.find(r => r.id === id);

  return (
    <div className="row">
      <div className="col-1 pr-0">
        <p className="heading my-2">Route Type</p>
      </div>
      <div className="col-4">
        <p className="heading my-2">Route ID</p>
      </div>
      <div className={outdated ? 'col-5 pl-0' : 'col-6 pl-0'}>
        <p className="heading my-2">Upstream Host</p>
      </div>
      {hasFilters &&
        (outdated ? (
          <div className="col-2 pl-0 text-right">
            <p className="heading my-2">Log is outdated</p>
          </div>
        ) : (
          <div className="col-1 pl-0 text-center" />
        ))}
      {logRoutes.map(routeId => (
        <MatchingRoute
          key={routeId}
          routeId={routeId}
          route={route(routeId)}
          matchingFilters={matchingFilters}
          matchingOperations={matchingOperations}
          outdated={outdated}
          activePhase={activePhase}
          logRouteType={logRouteType}
        />
      ))}
    </div>
  );
};

export default MatchingRoutesList;
