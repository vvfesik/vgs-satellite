import React from 'react';
import RouteEntrySummary from 'src/components/organisms/RouteEntry/RouteEntrySummary';
import { IconTrue, IconFalse } from './MatchIcons';
import { IEntry } from 'src/redux/interfaces/routes';

export interface IMatchingOperationsProps {
  entry: IEntry;
  matched: boolean;
}

const MatchingOperations: React.SFC<IMatchingOperationsProps> = (props) => {
  const { matched, entry } = props;

  return (
    <div className="col-12">
      <div className="row px-3">
        <div className="col-1 pr-0 my-auto">
          <p className="heading my-auto pt-1 text-text-light">Operations</p>
        </div>
        <div className="col-1 m-auto text-center">
          {matched ? <IconTrue /> : <IconFalse />}
        </div>
        <RouteEntrySummary
          className="col-10 mt-1 text-text-light"
          entry={entry}
        />
      </div>
    </div>
  );
};

export default MatchingOperations;
