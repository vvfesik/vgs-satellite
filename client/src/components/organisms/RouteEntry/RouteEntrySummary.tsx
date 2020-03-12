import React from 'react';
import { IEntry } from 'src/redux/interfaces/routes';

export interface IRouteEntrySummaryProps {
  entry: IEntry;
  className?: string;
}

const transformersMapping: any = {
  FORM_FIELD: 'Form field',
  JSON_PATH: 'JSON path',
  REGEX: 'Regular expression',
  XPATH: 'XML',
  HTML: 'HTML',
  PDF_METADATA_TOKEN: 'PDF',
  CSV: 'CSV',
};

const operationsMappings: any = {
  REDACT: 'Redact',
  ENRICH: 'Reveal',
};

const RouteEntrySummary: React.SFC<IRouteEntrySummaryProps> = (props) => {
  const { entry, className = 'text-mono align-self-center' } = props;

  return (
    <div className={className} data-role="route-summary-item">
      <strong>{operationsMappings[entry.operation!]}</strong>
      &nbsp;the <strong>{transformersMapping[entry.transformer!]}</strong>
      &nbsp;entries <strong>{(entry.transformer_config || []).join(', ')}</strong>
      &nbsp;in the <strong>{(entry.phase || '').toLowerCase()}</strong>
      &nbsp;targets: <strong>{(entry.targets.join(', ') || '').toLowerCase()}</strong>
    </div>
  );
};

export default RouteEntrySummary;
