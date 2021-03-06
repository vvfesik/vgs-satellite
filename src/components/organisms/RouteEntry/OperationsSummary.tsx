import React from 'react';
import { getCustomOperationsNames } from 'src/redux/utils/utils';
import { IEntry } from 'src/redux/interfaces/routes';
import classNames from 'classnames';

export interface IRouteEntrySummaryProps {
  entry: IEntry;
  className?: string;
}

const OperationsSummary: React.SFC<IRouteEntrySummaryProps> = (props) => {
  const { entry, className } = props;
  const operationsList = getCustomOperationsNames(entry.operations);
  return (
    <div className={classNames(className, 'align-self-center')}>
      <span>{operationsList}</span>
    </div>
  );
};

export default OperationsSummary;
