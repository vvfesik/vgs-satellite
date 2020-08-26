export interface ILogRoute {
  attributes: {
    matched: boolean;
    route_id: string;
    trace_id: string;
  };
  id: string;
  type: 'routes';
}

export interface ILogRoutes {
  data: ILogRoute[];
}

export interface ILog {
  id: string;
  isLoaded: boolean;
  flow?: IFlow;
  logType: string;
  requestId: string;
  upstream_status: string;
  routes: ILogRoutes;
  route_type: 'reverse' | 'forward';
  occurred_at: string;
  expired_at: string | null;
  proxy_status: string;
  upstream: string;
  path: string;
  http: {
    method: string;
  };
  pinned: boolean;
}

export interface IFlow {
  version: string;
  isResponse: boolean;
  requestId: string;
  request: {
    method: string;
    date: string;
    body: string;
    headers: object[] | null;
    httpVersion: string;
    url: string;
  };
  response: {
    body: string;
    headers: object[] | null;
    status: number;
    isSuccess: boolean;
    isWarning: boolean;
    isFail: boolean;
    httpVersion: string;
    statusText: string;
    isEmptyStatus: boolean;
  };
  routes: ILogRoutes;
}

export type IPartialFlow = Partial<IFlow>;

export interface ISecureDebuggerSettings {
  isEnabled: boolean;
  selectedFlow: IFlow | null;
}

export interface ILogsFilterState {
  trace_id: string;
  from: string | null;
  to: string | null;
  method: string;
  protocol: string;
  pinned: boolean | null;
}

export type IPartialLogsFilterState = Partial<ILogsFilterState>;

export interface ILogFilter {
  attributes: {
    filter_id: string;
    occurred_at: string;
    operation_applied: boolean;
    trace_id: string;
  };
  id: string;
  type: 'filters';
}

export interface ILogOperation {
  attributes: {
    expressions: string[];
    filter_id: string;
    occurred_at: string;
    operation: string;
    phase: string;
    route_id: string;
    trace_id: string;
  };
  id: string;
  type: 'operations';
}

export interface ILogFilters {
  filters: ILogFilter[];
  operations: ILogOperation[];
}

export interface ILogHeaders {
  request: string[][];
  requestRewritten: string[][];
  response: string[][];
  responseRewritten: string[][];
}

export interface ILogBody {
  request: string;
  requestRewritten: string;
  response: string;
  responseRewritten: string;
}

export interface ILogsState {
  logsCount: number;
  isLoading: boolean;
  isFiltering: boolean;
  logs: ILog[];
  flows: IFlow[];
  filterState: ILogsFilterState;
  secureDebugger: ISecureDebuggerSettings;
  pinLoadingList: string[];
}
