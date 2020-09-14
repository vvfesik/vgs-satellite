import React from 'react';
import { getOperationsName } from 'src/redux/utils/utils';
import { IEntry } from 'src/redux/interfaces/routes';
import classNames from 'classnames';

export interface IRouteEntrySummaryProps {
  entry: IEntry;
  className?: string;
}

const OperationsSummary: React.SFC<IRouteEntrySummaryProps> = (props) => {
  const { entry, className } = props;
  const operationsList = getOperationsName(entry.operations);
  return (
    <div className={classNames(className, 'align-self-center')}>
      <span>SetupPipelineOperation{operationsList && `, ${operationsList}`}</span>
    </div>
  );
};

export default OperationsSummary;
