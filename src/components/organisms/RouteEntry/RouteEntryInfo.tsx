import React from 'react';
import { IRoute, IEntry } from 'src/redux/interfaces/routes';
import RouteEntrySummary from 'src/components/organisms/RouteEntry/RouteEntrySummary';
import MatchingConditionsDetails from 'src/components/organisms/FlowView/MatchingConditionsDetails';

export interface IRouteEntryInfoProps {
  route: IRoute;
}

const RouteEntryInfo: React.SFC<IRouteEntryInfoProps> = (props) => {
  const { route } = props;

  return (
    <>
      {route.entries.map((entry: IEntry) => (
        <div key={entry.id} className="row w-100 mx-0">
          <hr className="w-100 mt-2 mb-0 text-info"/>
          <div>
            <p className="filter-title mt-3 mb-2">Conditions</p>
            <div className="ml-4">
              <MatchingConditionsDetails entry={entry} />
            </div>
            <p className="filter-title mt-3 mb-2">Operations</p>
            <RouteEntrySummary entry={entry} className="ml-4" />
          </div>
        </div>
      ))}
    </>
  );
};

export default RouteEntryInfo;
