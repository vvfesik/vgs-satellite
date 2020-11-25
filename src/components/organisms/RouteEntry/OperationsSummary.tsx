import React from 'react';
import { getOperationsV2Name } from 'src/redux/utils/utils';
import { IEntry } from 'src/redux/interfaces/routes';
import classNames from 'classnames';

export interface IRouteEntrySummaryProps {
  entry: IEntry;
  className?: string;
}

const OperationsSummary: React.SFC<IRouteEntrySummaryProps> = (props) => {
  const { entry, className } = props;
  const operationsList = getOperationsV2Name(entry.operations_v2);
  return (
    <div className={classNames(className, 'align-self-center')}>
      <span>{operationsList}</span>
    </div>
  );
};

export default OperationsSummary;
