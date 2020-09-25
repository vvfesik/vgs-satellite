import React from 'react';
import RouteEntrySummary from 'src/components/organisms/RouteEntry/RouteEntrySummary';
import { IconTrue, IconFalse } from './MatchIcons';
import { IEntry } from 'src/redux/interfaces/routes';

export interface IMatchingOperationsProps {
  entry: IEntry;
  matched: boolean;
}

const MatchingOperations: React.FC<IMatchingOperationsProps> = (props) => {
  const { matched, entry } = props;

  return (
    <div className="row px-3 mt-2">
      <div className="col-md-2 col-xl-1 pr-0">
        <p className="heading text-text-light pt-1 mt-1 mb-0">Operations</p>
      </div>
      <div className="col m-auto text-text-light d-flex">
        <span className="pr-3">
          {matched ? <IconTrue /> : <IconFalse />}
        </span>
        <RouteEntrySummary entry={entry} />
      </div>
    </div>
  );
};

export default MatchingOperations;
