import {
  getRoutes,
  createRoute,
  deleteRouteById,
  updateRouteById,
} from 'src/redux/apis/routes';
import { set } from 'lodash';
import { notify } from 'src/redux/utils/notifications';
import { getRouteTemplate } from 'src/data/routes';
import { IRoutesState, IRoute } from 'src/redux/interfaces/routes';

const SET_LOADING = 'SET_LOADING';
const GET_ROUTES_LIST = 'GET_ROUTES_LIST';
const GET_ROUTE = 'GET_ROUTE';
const DELETE_ROUTE = 'DELETE_ROUTE';
const TOGGLE_ROUTE_CONFIRM_DELETE_MODAL = 'TOGGLE_ROUTE_CONFIRM_DELETE_MODAL';
const SET_SAVE_PROGRESS = 'SET_SAVE_PROGRESS';
const UPDATE_CURRENT_ROUTE = 'UPDATE_CURRENT_ROUTE';

export function fetchRoutes() {
  return async (dispatch: any) => {
    dispatch({
      type: SET_LOADING,
      data: true,
    });
    const response = await getRoutes();
    dispatch({
      type: GET_ROUTES_LIST,
      data: response.data,
    });
    dispatch({
      type: SET_LOADING,
      data: false,
    });
  };
}

export function saveRoute(
  route: IRoute,
  params: {
    hideNotify?: boolean,
    cb?: (args?: any) => void,
    source?: string,
  } = { hideNotify: false },
) {
  return async (dispatch: any) => {
    try {
      dispatch({
        type: SET_SAVE_PROGRESS,
        data: true,
      });
      set(
        route,
        route.attributes ? 'attributes.tags.source' : 'tags.source',
        'vgs-satellite',
      );
      set(
        route,
        route.attributes ? 'attributes.tags.analytic_id' : 'tags.analytic_id',
        window.heap?.userId,
      );
      await createRoute(route);
      if (!params.hideNotify) {
        notify.success('Route created successfully');
      }
      const response = await getRoutes();
      dispatch({
        type: GET_ROUTES_LIST,
        data: response.data,
      });
      if (params && params.cb) {
        params.cb();
      }
    } catch (error) {
      notify.error(error);
    } finally {
      dispatch({
        type: SET_SAVE_PROGRESS,
        data: false,
      });
    }
  };
}

export function updateRoute(
  route: IRoute,
  params: {
    hideNotify?: boolean,
    cb?: (args?: any) => void,
    source?: string,
  } = { hideNotify: false },
) {
  return async (dispatch: any) => {
    try {
      dispatch({
        type: SET_SAVE_PROGRESS,
        data: true,
      });
      set(
        route,
        route.attributes ? 'attributes.tags.source' : 'tags.source',
        'vgs-satellite',
      );
      set(
        route,
        route.attributes ? 'attributes.tags.analytic_id' : 'tags.analytic_id',
        window.heap?.userId,
      );
      await updateRouteById(route, route.id!);
      if (!params.hideNotify) {
        notify.success('Your route was updated and your changes have been applied.');
      }
      const response = await getRoutes();
      dispatch({
        type: GET_ROUTES_LIST,
        data: response.data,
      });
      if (params && params.cb) {
        params.cb();
      }
    } catch (error) {
      notify.error(error);
    } finally {
      dispatch({
        type: SET_SAVE_PROGRESS,
        data: false,
      });
    }
  };
}

export function deleteRoute(routeId: string) {
  return async (dispatch: any) => {
    await deleteRouteById(routeId);
    notify.success('Route was deleted');
    dispatch({
      type: DELETE_ROUTE,
      data: routeId,
    });
    const response = await getRoutes();
    dispatch({
      type: GET_ROUTES_LIST,
      data: response.data,
    });
  };
}

export function toggleRouteConfirmDeleteModal(isOpen: boolean) {
  return (dispatch: any) => {
    dispatch({
      type: TOGGLE_ROUTE_CONFIRM_DELETE_MODAL,
      data: {
        isOpen,
      },
    });
  };
}

export function getRouteFromTemplate(routeType: string) {
  return {
    type: GET_ROUTE,
    data: getRouteTemplate(routeType === 'inbound'),
  };
}

export function updateCurrentRoute(route: IRoute | null) {
  return (dispatch: any) => {
    dispatch({
      type: UPDATE_CURRENT_ROUTE,
      data: route,
    });
  };
}

const initialState: IRoutesState = {
  isLoading: false,
  list: [],
  currentRoute: null,
  isSaveInProgress: false,
  routeTemplates: {
    list: {},
    isListLoading: false,
    isDetailsLoading: false,
    selectedKey: null,
  },
  createdRoute: null,
  routeConfirmDeleteModal: {
    isOpen: false,
  },
};

export default function reducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.data,
      };
    case GET_ROUTES_LIST:
      return {
        ...state,
        list: action.data,
      };
    case GET_ROUTE:
      return {
        ...state,
        currentRoute: action.data,
      };
    case TOGGLE_ROUTE_CONFIRM_DELETE_MODAL:
      return {
        ...state,
        routeConfirmDeleteModal: action.data,
      };
    case DELETE_ROUTE:
      return {
        ...state,
        routeConfirmDeleteModal: {
          isOpen: false,
        },
      };
    case SET_SAVE_PROGRESS:
      return {
        ...state,
        isSaveInProgress: action.data,
      };
    case UPDATE_CURRENT_ROUTE:
      return {
        ...state,
        currentRoute: action.data,
      };
    default:
      return state;
  }
}
