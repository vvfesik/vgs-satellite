import * as React from 'react';
import RouteTypeLabel from 'src/components/organisms/FlowsTable/RouteTypeLabel';
import FlowMethod from 'src/components/organisms/FlowsTable/FlowMethod';
import { ILog } from 'src/redux/interfaces/logs';
import { Badge, Table } from 'reactstrap';
import { badgeColor, getQueryParameters } from 'src/redux/utils/utils';
import DiffSnippet from 'src/components/atoms/DiffSnippet/DiffSnippet';
import _ from 'lodash';
import { Alert, Icon, Input, Popover } from 'src/components/antd';

interface IGeneralInfoProps {
  log: ILog;
  validUri: string;
  showRequestMethod: boolean;
  showRouteType: boolean;
  showStatusCode: boolean;
  isEditMode: boolean;
  generalInfo: any;
  onEditChange: (payload: any) => void;
  onEditSave: () => void;
}

const GeneralInfo: React.FC<IGeneralInfoProps> = (props) => {
  const { log, validUri, showRequestMethod, showRouteType, showStatusCode } = props;
  const { route_type, upstream_time_ms, upstream_status, proxy_status, http } = log;
  const { isEditMode, generalInfo, onEditChange, onEditSave } = props;

  return (
    <Table className="general-table pb-3">
      <tbody>
        {!!route_type && (
          <tr>
            <td className="smallbold w-25">Type</td>
              <td>
                {showRouteType
                  ? <RouteTypeLabel type={route_type} />
                  : route_type
                }
              </td>
          </tr>
        )}
        {!!log.request?.httpVersion && (
          <tr>
            <td className="smallbold">Protocol</td>
            <td>
              {isEditMode ? (
                <Input
                  value={generalInfo.request?.httpVersion ?? log.request.httpVersion}
                  onChange={e => onEditChange({ request: { httpVersion: e.target.value } })}
                  onPressEnter={onEditSave}
                />
              ) : (
                <span>{log.request.httpVersion}</span>
              )}
            </td>
          </tr>
        )}
        {!!validUri && !isEditMode && (
          <tr>
            <td className="smallbold">URL</td>
            <td>
              {validUri}
            </td>
          </tr>
        )}
        {isEditMode && (
          <>
            {log.request?.scheme && (
              <tr>
                <td className="smallbold">Scheme</td>
                <td>
                  <Input
                    value={generalInfo.request?.scheme ?? log.request.scheme}
                    onChange={e => onEditChange({ request: { scheme: e.target.value } })}
                    onPressEnter={onEditSave}
                  />
                </td>
              </tr>
            )}
            {log.request?.host && (
              <tr>
                <td className="smallbold">Host</td>
                <td>
                  <Input
                    value={generalInfo.request?.host ?? log.request.host}
                    onChange={e => onEditChange({ request: { host: e.target.value } })}
                    onPressEnter={onEditSave}
                  />
                </td>
              </tr>
            )}
            {log.request?.path && (
              <tr>
                <td className="smallbold">Path</td>
                <td>
                  <Input
                    value={generalInfo.request?.path ?? log.request.path}
                    onChange={e => onEditChange({ request: { path: e.target.value } })}
                    onPressEnter={onEditSave}
                  />
                </td>
              </tr>
            )}
          </>
        )}
        { log.flow && log.flow.request_rewritten && !!log.flow.request_rewritten.url &&
        !_.isEqual(getQueryParameters(log.flow.request.url), getQueryParameters(log.flow.request_rewritten.url)) ?
          <tr className="uri-diff">
            <td className="smallbold">Query Parameters</td>
            <DiffSnippet
              oldCode={getQueryParameters(log.flow.request.url)}
              newCode={getQueryParameters(log.flow.request_rewritten.url)}
              splitView={false}
              hideLineNumbers={true}
            />
          </tr>
          :
          log.flow && log.flow.request && !!log.flow.request.url &&
          getQueryParameters(log.flow.request.url) &&
            <tr>
              <td className="smallbold">Query Parameters</td>
              <td>{getQueryParameters(log.flow.request.url)}</td>
            </tr>
        }
        {showRequestMethod && !!http.method &&
          <tr>
            <td className="smallbold">Request Method</td>
            <td>
              {isEditMode ? (
                <Input
                  value={generalInfo.request?.method ?? http.method}
                  onChange={e => onEditChange({ request: { method: e.target.value } })}
                  onPressEnter={onEditSave}
                />
              ) : (
                <FlowMethod log={log} />
              )}
            </td>
          </tr>
        }
        {showStatusCode && !!upstream_status &&
          <tr>
            <td className="smallbold">Upstream Status Code</td>
            <td>
              {isEditMode ? (
                <Input
                  value={generalInfo.response?.code ?? upstream_status}
                  onChange={e => onEditChange({ response: { code: e.target.value } })}
                  onPressEnter={onEditSave}
                />
              ) : (
                <Badge color={badgeColor(upstream_status)}>
                  {upstream_status}
                </Badge>
              )}
            </td>
          </tr>
        }
        {!!proxy_status && upstream_status !== proxy_status && (
          <tr>
            <td className="smallbold">Status Code</td>
            <td>
              {isEditMode ? (
                <Input
                  value={generalInfo.response?.code ?? proxy_status}
                  onChange={e => onEditChange({ response: { code: e.target.value } })}
                  onPressEnter={onEditSave}
                />
              ) : (
                <Badge color={badgeColor(proxy_status)}>
                  {proxy_status}
                </Badge>
              )}
            </td>
          </tr>
        )}
        {!!upstream_time_ms && (
          <tr>
            <td className="smallbold">Upstream Latency</td>
            <td>{upstream_time_ms} ms</td>
          </tr>
        )}
        { !log.upstream_status && !log.proxy_status && !!log.error?.msg && (
          <tr>
            <td colSpan={2}>
              <Alert message={log.error.msg} type="warning" className="text-sm" />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default GeneralInfo;
