import React from 'react';
import MatchingFilter from './MatchingFilter';
import { IRoute, IEntry } from 'src/redux/interfaces/routes';
import {
  matchedInActivePhase,
  isInCollection,
} from 'src/redux/utils/utils';

export interface IMatchingRouteSummaryProps {
  route: IRoute;
  matchedConditions?: any[];
  matchedOperations: (filterId: string) => void;
  activePhase: string;
}

const MatchingRouteSummary: React.FC<IMatchingRouteSummaryProps> = (props) => {
  const { route, matchedConditions, matchedOperations, activePhase } = props;

  const isConditionsApplied = (filterId: string) => isInCollection(filterId, matchedConditions);
  const isOperationsMatched = (filterId: string) => Boolean(matchedOperations(filterId));

  return (
    <>
      {!matchedInActivePhase(route.entries, activePhase) ? (
        <div className="matching-filter row w-100 mx-0 py-3">
          <div className="col-1" />
          <div className="col-11 my-1 text-text-light">
            Nothing matched in <strong>{activePhase}</strong> phase
          </div>
        </div>
      ) : (
        route.entries.map((entry: IEntry) => (
          <MatchingFilter
            key={entry.id}
            entry={entry}
            isConditionsApplied={isConditionsApplied(entry.id)}
            isOperationsMatched={isOperationsMatched(entry.id)}
            activePhase={activePhase}
          />
        ))
      )}
    </>
  );
};

export default MatchingRouteSummary;
