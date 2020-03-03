import * as React from 'react';
import MatchingRouteSummary from './MatchingRouteSummary';
import PopoverBs from 'src/components/molecules/PopoverBs/PopoverBs';
import { IRoute } from 'src/redux/interfaces/routes';
import { getUpstream, getRouteType } from 'src/redux/utils/routes';
import { ILogOperation } from 'src/redux/interfaces/logs';

interface IMatchingRouteProps {
  route: IRoute;
  outdated: boolean;
  matchingFilters: string[];
  matchingOperations: ILogOperation;
  routeId: string;
  activePhase: string;
  logRouteType: string;
}

const MatchingRoute: React.SFC<IMatchingRouteProps> = (props) => {
  const { route, outdated, matchingFilters, matchingOperations, routeId, activePhase, logRouteType } = props;

  const matchedConditions = () => {
    const matched = [];
    if (matchingFilters) {
      matchingFilters.forEach((filter) => {
        const matchedRoute = route.entries.find(entry => entry.id === filter);
        if (!!matchedRoute) matched.push(matchedRoute);
      });
    }
    return matched;
  };

  const matchedOperations = filterId =>
    matchingOperations.find(o => o.filter_id === filterId);

  const routeType = !!route && getRouteType(route);

  return (
    <div className="matching-route w-100 mb-3">
      <div className="row heading w-100 mx-0">
        <div className="col-1 my-auto pr-0 position-relative">
          <p className="heading m-0 text-text">
            {!!route ? routeType : 'unknown'}
          </p>
          {!!route ? (
            logRouteType !== routeType.toLowerCase() && (
              <span className="tooltip-icon position-absolute right">
                <PopoverBs iconName="exclamation-circle" iconType="danger">
                  {routeType} routes have matched in {logRouteType} request.
                  Please, check upstream host of set routes.
                </PopoverBs>
              </span>
            )
          ) : (
            <span className="tooltip-icon position-absolute right">
              <PopoverBs iconName="exclamation-circle" iconType="danger">
                This route was probably deleted.
              </PopoverBs>
            </span>
          )}
        </div>
        <div className="col-4">
          <p className="my-1 pt-1">{routeId}</p>
        </div>
        <div className="col-7 pt-1 pl-0">
          {!!route && <p className="my-1">{getUpstream(route)}</p>}
        </div>
      </div>
      {!!route ? (
        !outdated && (
          <>
            {!!route.entries.length ? (
              <MatchingRouteSummary
                route={route}
                activePhase={activePhase}
                matchedConditions={matchedConditions()}
                matchedOperations={filterId => matchedOperations(filterId)}
              />
            ) : (
              <div className="matching-filter row w-100 mx-0 py-3">
                <div className="col-1" />
                <div className="col-11 my-1 text-text-light">
                  This route has no filters
                </div>
              </div>
            )}
          </>
        )
      ) : (
        <div className="matching-filter row w-100 mx-0 py-3">
          <div className="col-1" />
          <div className="col-11 my-1 text-text-light">
            This route no longer exists
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingRoute;
