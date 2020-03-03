
const SET_PRE_COLLECT_LOGS = 'SET_PRE_COLLECT_LOGS';
const CREATE_PRE_COLLECT_ROUTE = 'CREATE_PRE_COLLECT_ROUTE';
const CREATE_PRE_COLLECT_ROUTES = 'CREATE_PRE_COLLECT_ROUTES';
const TRIGGER_YAML_MODAL = 'TRIGGER_YAML_MODAL';

export function setPrecollectLogs(logs) {
  return (dispatch) => {
    dispatch({
      type: SET_PRE_COLLECT_LOGS,
      data: logs,
    });
  };
}

export function createPrecollectRoute(route) {
  return (dispatch) => {
    dispatch({
      type: CREATE_PRE_COLLECT_ROUTE,
      data: route,
    });
  };
}

export function createPrecollectRoutes(inbound, outbound) {
  return (dispatch) => {
    dispatch({
      type: CREATE_PRE_COLLECT_ROUTES,
      data: { inbound, outbound },
    });
  };
}

export function triggerYamlModal(open: boolean) {
  return (dispatch) => {
    dispatch({
      type: TRIGGER_YAML_MODAL,
      data: open,
    });
  };
}

const initialState = {
  list: [],
  route: null,
  routes: {
    inbound: null,
    outbound: null,
  },
  isYamlModalOpen: false,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_PRE_COLLECT_LOGS:
      return ({
        ...state,
        list: [...state.list, ...action.data],
      });
    case CREATE_PRE_COLLECT_ROUTE:
      return ({
        ...state,
        route: action.data,
      });
    case CREATE_PRE_COLLECT_ROUTES:
      return ({
        ...state,
        routes: { inbound: action.data.inbound, outbound: action.data.outbound },
      });
    case TRIGGER_YAML_MODAL:
      return ({
        ...state,
        isYamlModalOpen: action.data,
      });
    default:
      return state;
  }
}
