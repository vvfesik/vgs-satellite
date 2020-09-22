import React, { useEffect, useState } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import UploadButton from 'src/components/atoms/UploadButton/UploadButton';
import FlowsTable from 'src/components/organisms/FlowsTable/FlowsTable';
import FlowView from 'src/components/organisms/FlowView/FlowView';
import QuickIntegrationModal from 'src/components/organisms/QuickIntegration/QuickIntegrationModal';
import Yaml from 'src/components/molecules/Yaml/Yaml';
import Code from 'src/components/atoms/Code/Code';
import { entryToLog, entryToFlow } from 'src/redux/utils/preCollect';
import {
  addPrecollectLogs,
  triggerYamlModal,
  fetchFlows,
  replayRequest,
  duplicateRequest,
  deleteRequest,
  editRequest,
} from 'src/redux/modules/preCollect';
import { saveRoute } from 'src/redux/modules/routes';
import { constructUriFromLog } from 'src/redux/utils/utils';
import { IRoute } from 'src/redux/interfaces/routes';

function mapStateToProps({ preCollect, routes }: any) {
  return {
    logs: preCollect.list,
    preRoute: preCollect.route,
    preRoutes: preCollect.routes,
    isYamlModalOpen: preCollect.isYamlModalOpen,
    isUploaded: preCollect.isUploaded,
    isSavingRoute: routes.isSaveInProgress,
  };
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      addPrecollectLogs,
      triggerYamlModal,
      fetchFlows,
      replayRequest,
      duplicateRequest,
      deleteRequest,
      editRequest,
      saveRoute,
    },
    dispatch,
  );
};

export interface IPreCollectContainerProps {
  routeType: 'inbound' | 'outbound';
  logs: any[];
  addPrecollectLogs: (logs: any[]) => void;
  fetchFlows: () => void;
  preRoutes: IRoute[];
  triggerYamlModal: any;
  isYamlModalOpen: boolean;
  isUploaded: boolean;
  isSavingRoute: boolean;
  replayRequest: (logId: string) => void;
  duplicateRequest: (logId: string) => void;
  deleteRequest: (logId: string) => void;
  editRequest: (logId: string, payload: any) => void;
  saveRoute: (route: IRoute) => void;
}

export const PreCollectContainer: React.FunctionComponent<IPreCollectContainerProps> = (props) => {
  const {
    routeType,
    logs,
    preRoutes,
    triggerYamlModal,
    isYamlModalOpen,
    isUploaded,
    isSavingRoute,
    replayRequest,
    duplicateRequest,
    deleteRequest,
    editRequest,
    saveRoute,
  } = props;

  const [selectedLog, selectLog] = useState(null);
  const [isSecurePayload, securePayload] = useState(false);
  const [preRouteType, setPreRouteType] = useState<'inbound'|'outbound'>('inbound');

  const onUpload = (har) => {
    const harParsed = JSON.parse(har);

    props.addPrecollectLogs(harParsed.log.entries);
  };

  useEffect(() => {
    if (isYamlModalOpen || selectedLog || isSecurePayload || isUploaded) {
      return;
    };
    props.fetchFlows();
  }, [isYamlModalOpen, selectedLog, isSecurePayload, isUploaded]);

  const handleOnRuleCreate = (selectedPhase: 'REQUEST' | 'RESPONSE') => {
    selectLog(null);
    securePayload(entryToFlow(selectedLog, selectedPhase));
  };

  const handleReplay = () => {
    replayRequest(selectedLog.id);
    selectLog(null);
  }
  const handleDuplicate = () => {
    duplicateRequest(selectedLog.id);
    selectLog(null);
  }
  const handleDelete = () => {
    deleteRequest(selectedLog.id);
    selectLog(null);
  };

  const handleSaveRoute = (route: IRoute) => {
    saveRoute(route);
  }

  const handleEdit = (logId: string, payload: any) => {
    editRequest(logId, payload);
    selectLog(null);
  }

  const demoCurl = `curl https://httpbin.org/post -k \\
  -x localhost:9099 \\
  -H "Content-type: application/json" \\
  -d '{"foo": "bar"}'`

  return (
    <div className="container-fluid">
      <UploadButton onUpload={data => onUpload(data)} />
      {isSecurePayload && (
        <QuickIntegrationModal
          isReverse={preRouteType === 'inbound'}
          log={isSecurePayload}
          url={constructUriFromLog(isSecurePayload)}
          closeModal={() => securePayload(false)}
        />
      )}

      {selectedLog ? (
        <FlowView
          log={entryToFlow(selectedLog)}
          logFilters={{}}
          showSpinner={false}
          routes={null}
          onClose={() => selectLog(null)}
          onRuleCreate={(selectedPhase: string) => handleOnRuleCreate(selectedPhase)}
          setPreRouteType={type => setPreRouteType(type)}
          onReplay={handleReplay}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onEdit={(logId: string, payload: any) => handleEdit(logId, payload)}
        />
      ) : null}

      {!!logs.length ? (
        <FlowsTable
          onSelect={selectLog}
          logs={logs.map(entry => entryToLog(entry, routeType))}
        />
      ) : (
        <Code language="bash" className="ant-card card px-5 bg-light">{demoCurl}</Code>
      )}
      <Yaml
        routes={preRoutes}
        isExternal={true}
        setExternalToggle={() => triggerYamlModal(!isYamlModalOpen)}
        isExternalOpen={isYamlModalOpen}
        handleSaveRoute={handleSaveRoute}
        isSavingRoute={isSavingRoute}
      />
    </div>
  );
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(PreCollectContainer);
