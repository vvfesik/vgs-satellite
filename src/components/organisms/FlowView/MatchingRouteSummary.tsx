import React from 'react';
import MatchingFilter from './MatchingFilter';
import { IRoute } from 'src/redux/interfaces/routes';
import {
  matchedInActivePhase,
  isInCollection,
} from 'src/redux/utils/utils';

export interface IMatchingRouteSummaryProps {
  route: IRoute;
  matchedConditions?: any[];
  matchedOperations?: (filterId: string) => void;
  activePhase?: string;
}

const MatchingRouteSummary: React.SFC<IMatchingRouteSummaryProps> = (props) => {
  const { route, matchedConditions, matchedOperations, activePhase } = props;
  const entries = route.entries.filter(entry => !entry.operations);

  return (
    <>
      {!matchedInActivePhase(entries, activePhase) ? (
        <div className="matching-filter row w-100 mx-0 py-3">
          <div className="col-1" />
          <div className="col-11 my-1 text-text-light">
            Nothing matched in <strong>{activePhase}</strong> phase
          </div>
        </div>
      ) : (
        entries.map(entry => (
          <MatchingFilter
            key={entry.id}
            entry={entry}
            isConditionsApplied={isInCollection(entry.id!, matchedConditions)}
            isOperationsMatched={matchedOperations(entry.id!)}
            activePhase={activePhase}
          />
        ))
      )}
    </>
  );
};

export default MatchingRouteSummary;
