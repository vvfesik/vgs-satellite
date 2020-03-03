import React from 'react';
import { IconTrue, IconFalse } from './MatchIcons';
import { IEntry } from 'src/redux/interfaces/routes';
import MatchingConditionsDetails from './MatchingConditionsDetails';

export interface IMatchingConditionsProps {
  entry: IEntry;
  applied: boolean;
}

const MatchingConditions: React.SFC<IMatchingConditionsProps> = (props) => {
  const { entry, applied } = props;

  return (
    <div className="row px-3 mt-2">
      <div className="col-1 pr-0 my-auto">
        <p className="heading my-auto pt-1 text-text-light">Conditions</p>
      </div>
      <div className="col-1 m-auto text-center">
        {applied ? <IconTrue /> : <IconFalse />}
      </div>
      <div className="col-10 my-auto">
        <p className="text-text-light mb-0 mt-1">
          <MatchingConditionsDetails entry={entry} />
        </p>
      </div>
    </div>
  );
};

export default MatchingConditions;
