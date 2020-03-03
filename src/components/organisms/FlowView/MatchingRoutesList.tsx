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

const MatchingRoutesList: React.SFC<IMatchingRoutesListProps> = (props) => {
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
  const route = id => matchingRoutes.find(r => r.id === id);

  const findOperations = routeId =>
    matchingOperations.filter(o => o.route_id === routeId);

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
      {hasFilters && (
        <>
          {outdated ? (
            <div className="col-2 pl-0 text-right">
              <p className="heading my-2">Log is outdated</p>
            </div>
          ) : (
            <div className="col-1 pl-0 text-center" />
          )}
        </>
      )}
      {logRoutes.map(logRoute => (
        <MatchingRoute
          key={logRoute.attributes.route_id}
          routeId={logRoute.attributes.route_id}
          route={route(logRoute.attributes.route_id)}
          matchingFilters={matchingFilters}
          matchingOperations={findOperations(logRoute.attributes.route_id)}
          outdated={outdated}
          activePhase={activePhase}
          logRouteType={logRouteType}
        />
      ))}
    </div>
  );
};

export default MatchingRoutesList;
