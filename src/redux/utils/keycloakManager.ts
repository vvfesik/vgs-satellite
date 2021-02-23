import Keycloak from 'keycloak-js';
import { pickBy } from 'lodash';
import { IKeycloakInstance } from 'src/redux/modules/auth';

const keycloakInstances: { [client: string]: IKeycloakInstance } = {};

const keycloakLogin = (kc: Keycloak.KeycloakInstance, loginOptions?: any) => {
  const url = window.location.href;
  const { origin } = window.location;
  const path = url.split(origin)[1];
  const exclusions = ['logout', '?idp=', 'session_state='];
  if (!exclusions.find((exclusion) => path.includes(exclusion)) && path !== '/') {
    localStorage.setItem('pathToRedirect', path);
  }
  const options = pickBy(
    {
      idpHint: new URL(window.location.href).searchParams.get('idp'),
      ...loginOptions,
    },
    (val: any) => Boolean(val),
  );

  return kc.login(options);
};

const init = (
  kcConfig: any,
  initParams: any,
  loginOptions?: any,
): Promise<IKeycloakInstance> => new Promise((res: any) => {
  keycloakInstances[kcConfig.clientId] = Keycloak(kcConfig) as IKeycloakInstance;

  keycloakInstances[kcConfig.clientId]
    .init(initParams)
    .then(async (isAuthenticated: boolean) => {
      if (isAuthenticated) {
        res(keycloakInstances[kcConfig.clientId]);
      } else {
        if (loginOptions) {
          keycloakLogin(keycloakInstances[kcConfig.clientId], loginOptions);
        }
      }
    })
    .catch(() => {
      localStorage.removeItem('authState');
      if (loginOptions) {
        keycloakLogin(keycloakInstances[kcConfig.clientId], loginOptions);
      }
    });
});

export default init;
