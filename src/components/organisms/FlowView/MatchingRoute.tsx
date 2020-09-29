import * as React from 'react';
import MatchingRouteSummary from './MatchingRouteSummary';
import { IRoute, IEntry } from 'src/redux/interfaces/routes';
import { getUpstream, getRouteType } from 'src/redux/utils/routes';
import { ILogOperation } from 'src/redux/interfaces/logs';
import { Button, Icon, Popover } from 'src/components/antd';
import history from 'src/redux/utils/history';

interface IMatchingRouteProps {
  route: IRoute;
  outdated: boolean;
  matchingFilters: string[];
  matchingOperations: ILogOperation[];
  routeId: string;
  activePhase: string;
  logRouteType: string;
}

const MatchingRoute: React.FC<IMatchingRouteProps> = (props) => {
  const { route, outdated, matchingFilters, matchingOperations, routeId, activePhase, logRouteType } = props;

  const matchedConditions = () => {
    const matched: IEntry[] = [];
    if (matchingFilters) {
      matchingFilters.forEach((filter) => {
        const matchedRoute = route.entries.find(entry => entry.id === filter);
        if (!!matchedRoute) matched.push(matchedRoute);
      });
    }
    return matched;
  };

  const matchedOperations = (filterId: string) =>
    matchingOperations?.find(o => o.id === filterId && o.operation_applied === true);

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
              <Popover
                trigger='hover'
                content={
                  <span className='text-sm d-inline-block'>
                    {routeType} routes have matched in {logRouteType} request.
                    Please, check upstream host of set routes.
                  </span>
                }
              >
                <Icon type='exclamation-circle' className='tooltip-icon position-absolute right mt-1 ml-1 text-danger' />
              </Popover>
            )
          ) : (
            <Popover
              trigger='hover'
              content={
                <span className='text-sm d-inline-block'>
                  This route was probably deleted.
                </span>
              }
            >
              <Icon type='exclamation-circle' className='tooltip-icon position-absolute right mt-1 ml-1 text-danger' />
            </Popover>
          )}
        </div>
        <div className="col-4">
          {!!route ? (
            <Button
              type="link"
              className="p-0 my-1"
              onClick={() => history.push(`/routes/${route.id}/edit`)}
            >
              {route.id}
            </Button>
          ) : (
            <p className="my-1 pt-1">{routeId}</p>
          )}
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
