import axios from 'axios';
import config from 'src/config/config';
import { IRoute } from 'src/redux/interfaces/routes';
import { IVaultEssentials } from 'src/redux/interfaces/vault';
import { fetchJSONApi, makeHeaders } from 'src/redux/utils/apis';

export const getRoutes = () =>
  axios.get(`${config.satelliteApiEndpoint}/route`);

export const getRouteById = (routeId: string) =>
  axios.get(`${config.satelliteApiEndpoint}/route/${routeId}`);

export const createRoute = (route: IRoute) =>
  axios.post(`${config.satelliteApiEndpoint}/route`, {
    data: {
      attributes: route.attributes || route,
      type: 'rule-chains',
    },
  });

export const updateRouteById = (route: IRoute, routeId: string) =>
  axios.put(`${config.satelliteApiEndpoint}/route/${routeId}`, {
    data: {
      attributes: route.attributes || route,
      type: 'rule-chains',
    },
  });

export const deleteRouteById = (routeId: string) =>
  axios.delete(`${config.satelliteApiEndpoint}/route/${routeId}`);

export const getRemoteRoutesByVault = (vault: IVaultEssentials) => {
  const url = `${vault.vault_management_api}/rule-chains`;
  const options = {
    headers: makeHeaders({ 'VGS-Tenant': vault.identifier }),
  };
  return fetchJSONApi(url, options);
};

export const updateRemoteRouteForVault = (vault: IVaultEssentials, route: IRoute) => {
  let url = `${vault.vault_management_api}/rule-chains/${route.id || route.attributes?.id}`;
  const options = {
    noTrim: true,
    method: 'PUT',
    headers: makeHeaders({ 'VGS-Tenant': vault.identifier }),
    data: {
      data: {
        attributes: route.attributes || route,
        type: 'rule-chains',
      },
    },
  };
  return fetchJSONApi(url, options);
}
