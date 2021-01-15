import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import FlowNav from './FlowNav';
import FlowButtons from './FlowButtons';
import RequestInfo from './RequestInfo';
import GeneralInfo from './GeneralInfo';
import MatchingDetails from './MatchingDetails';
import EventLogs from './EventLogs';
import Icon from 'src/components/atoms/Icon/Icon';
import { Modal, ModalBody } from 'reactstrap';
import { ILog, ILogFilters } from 'src/redux/interfaces/logs';
import { IRoute } from 'src/redux/interfaces/routes';
import { IEventLog } from 'src/redux/interfaces/eventLogs';
import { constructUriFromLog } from 'src/redux/utils/utils';
import { fetchEventLogs } from 'src/redux/modules/eventLogs';
import { pushEvent } from 'src/redux/utils/analytics';

const mapStateToProps = ({ eventLogs }: any) => {
  return {
    currentEventLog: eventLogs.current,
    isLoadingEventLogs: eventLogs.isLoading,
  };
}

const mapDispatchToProps = { fetchEventLogs };

export interface IFlowViewProps {
  log: ILog;
  routes: IRoute[];
  logFilters: ILogFilters;
  showSpinner: boolean;
  currentEventLog: IEventLog[];
  isLoadingEventLogs: boolean;
  onRuleCreate: (selectedPhase: string) => void;
  onClose: () => void;
  setPreRouteType: (type: 'inbound' | 'outbound') => void;
  setProxyMode: (mode: 'regular' | 'forward' | undefined) => void;
  onReplay: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: (logId: string, payload: any) => void;
  fetchEventLogs: (flowId: string) => void;
}

type TFlowViewTabs = 'general' | 'headers' | 'body' | 'events';
type TFlowViewPhase = 'request' | 'response';


const FlowView: React.FunctionComponent<IFlowViewProps> = (props) => {
  const {
    log, log: { flow }, routes, showSpinner, logFilters, currentEventLog, isLoadingEventLogs,
    onRuleCreate, onClose, onReplay, onDuplicate, onDelete, onEdit, fetchEventLogs,
  } = props;

  const [selectedTab, setSelectedTab] = useState<TFlowViewTabs>('general');
  const [selectedPhase, setSelectedPhase] = useState<TFlowViewPhase>('request');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBigPayload, setIsBigPayload] = useState(false);
  const [contentType, setContentType] = useState();

  const [tabs, setTabs] = useState<TFlowViewTabs[]>(['general']);
  const [headers, setHeaders] = useState({});
  const [body, setBody] = useState({});
  const [generalInfo, setGeneralInfo] = useState({});

  const isMitmLog = log.hasOwnProperty('intercepted');

  useEffect(() => {
    const basicTabs: TFlowViewTabs[] = ['general', 'headers', 'body'];
    const mitmTabs: TFlowViewTabs[] = isMitmLog ? ['events'] : [];
    if (flow) {
      setTabs([...basicTabs, ...mitmTabs]);
      setHeaders({
        request: flow?.request?.headers,
        response: flow?.response?.headers,
        requestRewritten: flow?.request_rewritten?.headers,
        responseRewritten: flow?.response_rewritten?.headers,
      });
      setBody({
        request: flow?.request?.body,
        response: flow?.response?.body,
        requestRewritten: flow?.request_rewritten?.body,
        responseRewritten: flow?.response_rewritten?.body,
      });

      setContentType(headers.request?.find(h => h[0]?.toLowerCase() === 'content-type')?.[1]);
      setIsBigPayload(Object.keys(body || {}).some((key: string) => body[key]?.length > 3000));

      props.setPreRouteType(log.mode === 'regular' ? 'outbound' : 'inbound');
      props.setProxyMode(log.mode);
    }
  }, [flow])

  useEffect(() => {
    pushEvent('request_open', {
      url: constructUriFromLog(log),
      method: log.http.method,
      status: log.upstream_status || log.proxy_status,
      protocol: log.request?.httpVersion || log.request_raw?.http_version,
    });
  }, []);

  useEffect(() => {
    if (log.id) fetchEventLogs(log.id);
  }, [log.id]);

  const selectTab = (tab: TFlowViewTabs) => {
    setSelectedTab(tab);
    setSelectedPhase('request');
    pushEvent(`request_${tab}`);
  };

  const selectPhase = (phase: TFlowViewPhase) => {
    setSelectedPhase(phase);
    pushEvent(`request_${phase}`);
  };

  const hideSecureButton = () => {
    const isMethodGet = log.http?.method === 'GET';
    const isInvalidPath = !log.path?.match(/^(https?:)\/\//) && !log.upstream;
    return isMethodGet || isInvalidPath;
  }

  const handleRuleCreate = () => onRuleCreate(selectedPhase.toUpperCase());

  const handleOnEdit = () => {
    if (isEditMode) {
      setIsEditMode(false);
      onEdit(log.id, {
        request: {
          headers: headers.request,
          content: body.request,
          ...generalInfo.request,
        },
        response: {
          headers: headers.response,
          content: body.response,
          ...generalInfo.response,
        },
      });
    } else {
      setIsEditMode(true);
    }
  }

  const onEditChange = (payload: any) => {
    switch (selectedTab) {
      case 'body':
        setBody({
          ...body,
          [selectedPhase]: payload,
        });
        break;
      case 'headers':
        setHeaders({
          ...headers,
          [selectedPhase]: payload,
        });
        break;
      case 'general':
        setGeneralInfo({
          ...generalInfo,
          request: { ...generalInfo.request, ...payload.request },
          response: { ...generalInfo.response, ...payload.response },
        });
        break;
      default:
        break;
    }
  }

  const onEditCancel = () => {
    setIsEditMode(false);
    setHeaders({
      request: flow?.request?.headers,
      response: flow?.response?.headers,
      requestRewritten: flow?.request_rewritten?.headers,
      responseRewritten: flow?.response_rewritten?.headers,
    });
    setBody({
      request: flow?.request?.body,
      response: flow?.response?.body,
      requestRewritten: flow?.request_rewritten?.body,
      responseRewritten: flow?.response_rewritten?.body,
    });
    setGeneralInfo({});
  }

  const matchingRoutes = [].concat(
    routes.find(route => route.id === log.request?.match_details?.route_id) ?? [],
  );

  return (
    <Modal
      isOpen={true}
      toggle={onClose}
      fade={false}
      className="modal-lg flow-detail"
      data-role="log-details-modal"
    >
      <div className="modal-header">
        <h5 className="modal-title">Secure Data</h5>
        <Icon name="times" className="cursor-pointer" onClick={() => onClose()} />
      </div>
      <ModalBody>
        {!!log.id && (
          <p
            className='text-right text-text-light small-capsy'
            data-role='log-details-trace-id'
          >
            Request ID: {log.id}
          </p>
        )}
        <div data-role="log-details-modal-content">
          <FlowNav
            tabs={tabs}
            active={selectedTab}
            onSelectTab={selectTab}
          />
          <FlowButtons
            activePhase={selectedPhase}
            selectedTab={selectedTab}
            hasPayload={!!log.flow}
            hideSecureButton={hideSecureButton() || isBigPayload}
            onRuleCreate={() => handleRuleCreate()}
            onSelectPhase={selectPhase}
            onReplay={onReplay}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onEdit={handleOnEdit}
            onEditCancel={onEditCancel}
            isEditMode={isEditMode}
            isMitmLog={isMitmLog}
            onReloadEvents={() => fetchEventLogs(log.id)}
          />
          {selectedTab === 'general' && (
            <div className="mb-3 pt-0">
              <GeneralInfo
                log={log}
                validUri={constructUriFromLog(log)}
                showRouteType={true}
                showRequestMethod={true}
                showStatusCode={true}
                isEditMode={isEditMode}
                onEditChange={onEditChange}
                onEditSave={handleOnEdit}
                generalInfo={generalInfo}
              />
              <hr className="my-3" />
              <MatchingDetails
                log={log}
                matchingRoutes={matchingRoutes}
                logFilters={logFilters}
                showSpinner={showSpinner}
                activePhase={selectedPhase}
              />
            </div>
          )}
          {['headers', 'body'].includes(selectedTab) && (
            <RequestInfo
              headers={selectedTab === 'headers' && headers}
              body={selectedTab === 'body' && body}
              activePhase={selectedPhase}
              isEditMode={isEditMode}
              isBigPayload={isBigPayload}
              contentType={contentType}
              onEditChange={onEditChange}
              onEditSave={handleOnEdit}
            />
          )}
          {selectedTab === 'events' && (
            <EventLogs
              traceId={log.id}
              isLoading={isLoadingEventLogs}
              eventLogs={currentEventLog}
              routes={routes}
            />
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FlowView);
