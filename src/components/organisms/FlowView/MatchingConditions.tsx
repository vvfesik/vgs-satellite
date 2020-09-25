import React from 'react';
import { IconTrue, IconFalse } from './MatchIcons';
import { IEntry } from 'src/redux/interfaces/routes';
import MatchingConditionsDetails from './MatchingConditionsDetails';

export interface IMatchingConditionsProps {
  entry: IEntry;
  applied: boolean;
}

const MatchingConditions: React.FC<IMatchingConditionsProps> = (props) => {
  const { entry, applied } = props;

  return (
    <div className="row px-3 mt-2">
      <div className="col-md-2 col-xl-1 pr-0">
        <p className="heading text-text-light pt-1 mt-1 mb-0">Conditions</p>
      </div>
      <div className="col m-auto text-text-light d-flex">
        <span className="pr-3">
          {applied ? <IconTrue /> : <IconFalse />}
        </span>
        <MatchingConditionsDetails entry={entry} />
      </div>
    </div>
  );
};

export default MatchingConditions;
