import React from 'react';
import classnames from 'classnames';
import MatchingConditions from './MatchingConditions';
import MatchingOperations from './MatchingOperations';
import { isEqual } from 'src/redux/utils/utils';
import { IEntry } from 'src/redux/interfaces/routes';

export interface IMatchingFilterProps {
  entry: IEntry;
  isConditionsApplied?: boolean;
  isOperationsMatched?: boolean;
  activePhase?: string;
}

const MatchingFilter: React.SFC<IMatchingFilterProps> = (props) => {
  const { entry, isConditionsApplied, isOperationsMatched, activePhase } = props;

  return (
    <div
      className={classnames({
        'matching-filter row w-100 mx-0 py-3': isEqual(
          activePhase,
          entry.phase || '',
        ),
        'd-none': !isEqual(activePhase, entry.phase || ''),
      })}
    >
      <div className="col-12">
        <div className="row px-3">
          <p className="heading my-auto pt-1 text-text">Filter ID</p>
          <p className="my-auto ml-3 size-13 text-text">{entry.id}</p>
        </div>
        {!!entry.config.rules.length && (
          <MatchingConditions entry={entry} applied={isConditionsApplied} />
        )}
      </div>
      <MatchingOperations entry={entry} matched={isOperationsMatched} />
    </div>
  );
};

export default MatchingFilter;
