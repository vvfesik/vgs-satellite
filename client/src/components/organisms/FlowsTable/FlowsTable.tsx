import React from 'react';
import classnames from 'classnames';
import PayloadIcon from './PayloadIcon';
import RouteTypeLabel from './RouteTypeLabel';
import RoutesLabel from './RoutesLabel';
import StringWrapper from 'src/components/atoms/StringWrapper/StringWrapper';
import { ILog } from 'src/redux/interfaces/logs';
import { Badge, Table } from 'reactstrap';
import { Icon, Popover } from 'src/components/antd';
import {
  formatDate,
  dateFromNow,
  nowBeforeDate,
  badgeColor,
  constructUriFromLog,
} from 'src/redux/utils/utils';

export interface IFlowsTableProps {
  logs: ILog[];
  onSelect: (log: ILog) => void;
  showRoutes: boolean;
  showRequestId: boolean;
  showPin: boolean;
  onPinClick: (log: ILog) => void;
  pinLoadingList: string[];
}

const FlowsTable: React.SFC<IFlowsTableProps> = (props) => {
  const { logs, onSelect, showRoutes, showRequestId, showPin, onPinClick, pinLoadingList } = props;

  const urlRegex = RegExp('^(https?:)\/\/(([^:\/?#]*)(?::([0-9]+))?)');
  const isUrlValid = url => !!url && urlRegex.test(url);
  const splitUrl = url => isUrlValid(url) && url.match(urlRegex);
  const getDomain = url => splitUrl(url)[3];
  const getPathname = url => url.split(splitUrl(url)[0])[1];

  return (
    <div className="flow-logs mb-3">
      <Table striped className="flows-table" data-role="flows-table">
        <thead>
          <tr>
            <th className="flows-table_status">Status</th>
            <th className="flows-table_method">Method</th>
            <th>Domain</th>
            <th>Path</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr
              key={log.id ?? `${log.startedDateTime}${log.time}`}
              className={classnames({
                '--isLoaded': log.isLoaded,
              })}
              data-role="logs-row"
            >
              <td className="flows-table_status-column" onClick={() => onSelect(log)}>
                {(log.upstream_status || log.proxy_status) && (
                  <Badge
                    color={badgeColor(log.upstream_status || log.proxy_status)}
                  >
                    {log.upstream_status || log.proxy_status}
                  </Badge>
                )}
              </td>
              {log.http && !!log.http.method &&
                <td className="smallbold" onClick={() => onSelect(log)}>{log.http.method}</td>
              }
              <td onClick={() => onSelect(log)}>
                <div className="text-nowrap">
                  {isUrlValid(log.path) ? (
                    <StringWrapper
                      showAlways
                      size={35}
                      id={`domain-${log.id}`}
                      tooltipText={log.path}
                    >
                      {getDomain(log.path)}
                    </StringWrapper>
                  ) : (
                    log.upstream && (
                      <StringWrapper
                        showAlways
                        size={35}
                        id={`domain-${log.id}`}
                        tooltipText={constructUriFromLog(log)}
                      >
                        {log.upstream.split(/:\d+$/)[0]}
                      </StringWrapper>
                    )
                  )}
                </div>
              </td>
              <td onClick={() => onSelect(log)}>
                <div className="text-nowrap fixed-table">
                  {isUrlValid(log.path) ? (
                    <StringWrapper cutMiddle size={50} id={`path-${log.id}`}>
                      {getPathname(log.path)}
                    </StringWrapper>
                  ) : (
                    log.path &&
                    log.path.startsWith('/') && (
                      <StringWrapper cutMiddle size={50} id={`path-${log.id}`}>
                        {log.path}
                      </StringWrapper>
                    )
                  )}
                </div>
              </td>
              <td className="text-nowrap" onClick={() => onSelect(log)}>
                <span title={dateFromNow(log.occurred_at)}>
                  {formatDate(log.occurred_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default FlowsTable;
