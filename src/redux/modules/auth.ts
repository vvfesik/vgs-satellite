import qs from 'qs';
import axios from 'axios';
import {
  createPicker,
  createReducer,
  loadFromLocalStore,
} from 'src/redux/utils/modules';
import init from 'src/redux/utils/keycloakManager';
import { get } from 'lodash';
import { KeycloakInstance } from 'keycloak-js';
import { defaultTo, dropRepeats, omit } from 'ramda';
import config from 'src/config/config';

const { keycloakConfig } = config;

export interface IKeycloakInstance extends KeycloakInstance {
  tokenParsed: {
    exp: number;
    idp?: string;
    sub: string;
    preferred_username: string;
    user_id: string;
  };
}

interface IPermissions {
  [key: string]: { [key: string]: boolean };
}

const INIT_CLIENT = 'INIT_CLIENT';
const SET_ACTIVE_CLIENT = 'SET_ACTIVE_CLIENT';
const SET_PERMISSIONS = 'SET_PERMISSIONS';

const getKeycloakSession = (kc: IKeycloakInstance) => ({
  keycloak_exp: kc.tokenParsed.exp * 1000,
  keycloak_access_token: kc.token,
  keycloak_id_token: kc.idToken,
  keycloak_refresh_token: kc.refreshToken,
  keycloak_time_skew: kc.timeSkew,
  keycloak_idp: kc.tokenParsed.idp,

  /// TODO move to other reducers, or higher in reducer state tree
  currentUserId: kc.tokenParsed.sub,
  currentUserEmail: kc.tokenParsed.preferred_username,
  currentUserProfileId: kc.tokenParsed.user_id,
});

const calculatePermissions = (kc: IKeycloakInstance) => {
  const resourceAccess = get(kc, 'tokenParsed.resource_access');
  const permissions: IPermissions = {};
  Object.keys(resourceAccess).forEach((resource: string) => {
    permissions[resource] = {};
    resourceAccess[resource].roles.forEach((permission: string) => {
      permissions[resource][permission] = true;
    });
  });
  return permissions;
};

export const setActiveClient = (client: string) => async (dispatch: any) => dispatch({ type: SET_ACTIVE_CLIENT, data: client });

const getKeycloakAttributes = ({ access_token, domain, realm }: any) => axios({
  method: 'post',
  url: `${domain}/realms/${realm}/protocol/openid-connect/userinfo`,
  data: qs.stringify({ access_token }),
})
  .then(({ data }) => {
    return omit(['sub', 'user_id'], data);
  })
  .catch((e: any) => {
    console.log(e.response.status, e.response.data);
    throw new Error('error retrieving attribute via keycloak');
  });

const defaultState = {
  clients: [],
  activeClient: null,
  sessions: {},
  permissions: {},
};

const initialState = loadFromLocalStore('authState', defaultState);

export default createReducer(
  { ...initialState, activeClient: keycloakConfig.clientId },
  {
    [SET_ACTIVE_CLIENT]: (s: any, a: any) => ({ ...s, activeClient: a.data }),
    [INIT_CLIENT]: (s: any, a: any) => ({
      ...s,
      sessions: {
        ...s.sessions,
        [a.client]: {
          ...a.data,
        },
      },
      clients: dropRepeats(s.clients.concat(a.client).sort()),
      activeClient: a.client,
    }),
    [SET_PERMISSIONS]: (s: any, a: any) => ({
      ...s,
      permissions: {
        ...s.permissions,
        [a.client]: a.data,
      },
    }),
  },
);

export const pickFromAuth = createPicker('auth', defaultState);

export const initClient = (kcConfig: any, loginOptions?: any) => async (
  dispatch: any,
  getState: any,
): Promise<{ kc: IKeycloakInstance; attributes: any }> => {
  const { sessions }: any = pickFromAuth(['sessions'], getState());
  const clientSession = get(sessions, kcConfig.clientId, {});

  const initParams = {
    token: clientSession.keycloak_access_token,
    refreshToken: clientSession.keycloak_refresh_token,
    timeSkew: clientSession.keycloak_time_skew,
  };

const kc = await init(kcConfig, initParams, loginOptions);

  const attributes = await getKeycloakAttributes({
    access_token: kc.token,
    domain: keycloakConfig.url,
    realm: keycloakConfig.realm,
  });

  dispatch({
    type: INIT_CLIENT,
    client: kcConfig.clientId,
    data: { ...getKeycloakSession(kc), ...attributes },
  });

  dispatch({
    type: SET_PERMISSIONS,
    client: kcConfig.clientId,
    data: calculatePermissions(kc),
  });

  return { kc, attributes };
};

export const logout = (kcConfig: any) => async (_: any, getState: any) => {
  const { sessions }: any = pickFromAuth(['sessions'], getState());
  const clientSession = get(sessions, kcConfig.clientId, {});

  const initParams = {
    token: clientSession.keycloak_access_token,
    refreshToken: clientSession.keycloak_refresh_token,
    timeSkew: clientSession.keycloak_time_skew,
    checkLoginIframe: false,
  };

  const kc = await init(kcConfig, initParams);
  kc.logout();
};

export const pickFromActiveSession = createPicker(
  ({ auth }: any) => defaultTo({}, auth.sessions[auth.activeClient]),
  {
    keycloak_exp: true,
    keycloak_access_token: true,
    keycloak_idp: true,
    keycloak_id_token: true,
    keycloak_refresh_token: true,
    keycloak_time_skew: true,
    currentUserId: true,
    currentUserEmail: true,
    currentUserProfileId: true,
    preferred_username: true,
    vgs_staff: false,
  },
);
export const pickFromActivePermissions = createPicker(
  ({ auth }: any) => auth.permissions[auth.activeClient],
);

export const getAllPermissions = (client?: string) => (state: any) => {
  const { permissions, activeClient }: any = pickFromAuth(['permissions', 'activeClient'], state);
  return permissions[client || activeClient];
};
export const getPermissions = (permission: string, client?: string) => (state: any) => Boolean(get(getAllPermissions(client)(state), permission));

export const getExpirationTime = (clientId: string, state: any) => {
  const client = state.auth.sessions[clientId];
  return client ? client.keycloak_exp - Date.now() + client.keycloak_time_skew * 1000 : null;
};

export const isTokenExpired = (client: string, state: any) => {
  const expiresIn = getExpirationTime(client, state);
  return !expiresIn || expiresIn < 0;
};

export const refreshToken = (client: string, store: any): Promise<{ kc: IKeycloakInstance }> => store.dispatch(initClient(keycloakConfig));

export const getAccessToken = (client: string, state: any) => state.auth.sessions[client].keycloak_access_token;


// Dirty hack to enable es6 compatibility, previosly we had
// export let refreshIfExpired: (client?: string) => Promise<string>;
// which resulted in undefined within es6 or in webpack if createAuthListener
// wasn't called before refreshIfExpired import
//
// TODO: rework this module API & structure
// refreshIfExpired should not be a standalone export
// since it's a part of createAuthListener() state
let _refreshIfExpired: (client?: string) => Promise<string>;
export const refreshIfExpired: (client?: string) => Promise<string> = (client) => {
  if (_refreshIfExpired) return _refreshIfExpired(client);
  return Promise.resolve('');
};

export const createAuthListener = (store: any) => {
  let prevAuth: any;
  const refreshing: { [client: string]: Promise<{ kc: IKeycloakInstance }> | void } = {};

  return () => {
    const state = store.getState();
    if (prevAuth !== state.auth && state.auth.activeClient) {
      prevAuth = state.auth;

      _refreshIfExpired = async (client = state.auth.activeClient) => {
        if (isTokenExpired(client, state)) {
          if (!refreshing[client]) {
            refreshing[client] = refreshToken(client, store);
          }

          const { kc } = await (refreshing[client] as Promise<{ kc: IKeycloakInstance }>);
          delete refreshing[client];

          return kc.token;
        }

        return getAccessToken(client, state);
      };
    }
  };
};
