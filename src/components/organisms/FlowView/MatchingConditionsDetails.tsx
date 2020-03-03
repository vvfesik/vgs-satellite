import React from 'react';
import { flatExpressions } from 'src/redux/utils/utils';
import { IEntry } from 'src/redux/interfaces/routes';

export interface IMatchingConditionsDetailsProps {
  entry: IEntry;
}

const MatchingConditionsDetails: React.SFC<IMatchingConditionsDetailsProps> = (props) => {
  const { entry } = props;

  return (
    <>
      {entry.config.rules && entry.config.rules.map((rule, i) => (
        <strong key={`${entry.id}-${i}`}>
          {flatExpressions(rule)}
          {i !== entry.config.rules.length - 1 && ', '}
        </strong>
      ))}
    </>
  );
};

export default MatchingConditionsDetails;
