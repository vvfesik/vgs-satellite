import React, { useState, useEffect } from 'react';
import FlowNav from './FlowNav';
import FlowButtons from './FlowButtons';
import RequestInfo from './RequestInfo';
import GeneralInfo from './GeneralInfo';
import MatchingDetails from './MatchingDetails';
import Icon from 'src/components/atoms/Icon/Icon';
import { Modal, ModalBody } from 'reactstrap';
import { ILog, ILogFilters } from 'src/redux/interfaces/logs';
import { IRoute } from 'src/redux/interfaces/routes';
import { constructUriFromLog } from 'src/redux/utils/utils';

export interface IFlowViewProps {
  log: ILog;
  routes: IRoute[];
  logFilters: ILogFilters;
  showSpinner: boolean;
  onRuleCreate: (selectedPhase: string) => void;
  onClose: () => void;
  setPreRouteType: (type: 'inbound' | 'outbound') => void;
  onReplay: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: (logId: string, payload: any) => void;
}

type TFlowViewTabs = 'general' | 'headers' | 'body';
type TFlowViewPhase = 'request' | 'response';


const FlowView: React.FunctionComponent<IFlowViewProps> = (props) => {
  const { log, log: { flow }, routes, showSpinner, logFilters } = props;
  const { onRuleCreate, onClose, setPreRouteType, onReplay, onDuplicate, onDelete, onEdit } = props;

  const [selectedTab, setSelectedTab] = useState<TFlowViewTabs>('general');
  const [selectedPhase, setSelectedPhase] = useState<TFlowViewPhase>('request');
  const [isEditMode, setIsEditMode] = useState(false);

  const [tabs, setTabs] = useState<TFlowViewTabs[]>(['general']);
  const [headers, setHeaders] = useState({});
  const [body, setBody] = useState({});
  const [generalInfo, setGeneralInfo] = useState({});

  useEffect(() => {
    if (flow) {
      setTabs(['general', 'headers', 'body']);
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

      Object.keys(body).forEach((key: string) => {
        if (body[key] && body[key].length > 3000) {
          setBody({
            ...body,
            [key]: 'Payload is too big to render',
          });
        }
      });
    }
  }, [flow])

  const selectTab = (tab: TFlowViewTabs) => {
    setSelectedTab(tab);
    setSelectedPhase('request');
  }

  const hideSecureButton = () => {
    const isMethodGet = log.http?.method === 'GET';
    const isInvalidPath = !log.path?.match(/^(https?:)\/\//) && !log.upstream;
    return isMethodGet || isInvalidPath;
  }

  const handleRuleCreate = () => onRuleCreate(selectedPhase.toUpperCase());

  const isMitmLog = () => log.hasOwnProperty('intercepted');

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
        <FlowNav
          tabs={tabs}
          active={selectedTab}
          onSelectTab={(tab: TFlowViewTabs) => selectTab(tab)}
        />
        <FlowButtons
          activePhase={selectedPhase}
          selectedTab={selectedTab}
          hasPayload={!!log.flow}
          hideSecureButton={hideSecureButton()}
          onRuleCreate={() => handleRuleCreate()}
          onSelectPhase={(phase: TFlowViewPhase) => setSelectedPhase(phase)}
          setPreRouteType={setPreRouteType}
          onReplay={onReplay}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onEdit={handleOnEdit}
          onEditCancel={onEditCancel}
          isEditMode={isEditMode}
          isMitmLog={isMitmLog()}
        />
        {selectedTab === 'general' ? (
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
        ) : (
          <RequestInfo
            headers={selectedTab === 'headers' && headers}
            body={selectedTab === 'body' && body}
            activePhase={selectedPhase}
            isEditMode={isEditMode}
            onEditChange={onEditChange}
            onEditSave={handleOnEdit}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

export default FlowView;
