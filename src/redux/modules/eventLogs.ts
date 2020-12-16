import { getEventLogs } from 'src/redux/apis/eventLogs';
import { notify } from 'src/redux/utils/notifications';

const SET_LOADING = 'SET_LOADING';
const GET_EVENT_LOG = 'GET_EVENT_LOG';

export function fetchEventLogs(flowId: string) {
  return async (dispatch: any) => {
    try {
      dispatch({
        type: SET_LOADING,
        data: true,
      });
      const response = await getEventLogs(flowId);
      dispatch({
        type: GET_EVENT_LOG,
        data: response.data,
      });
    } catch (error) {
      notify.error(error.message);
    } finally {
      dispatch({
        type: SET_LOADING,
        data: false,
      });
    }
  };
}

const initialState = {
  isLoading: false,
  current: null,
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.data,
      };
    case GET_EVENT_LOG:
      return {
        ...state,
        current: action.data?.logs,
      };
    default:
      return state;
  }
}
