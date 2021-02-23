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

export const createRemoteRouteByVault = (vault: IVaultEssentials, route: IRoute) => {
  const url = `${vault.vault_management_api}/rule-chains`;
  const options = {
    noTrim: true,
    method: 'POST',
    headers: makeHeaders({ 'VGS-Tenant': vault.identifier }),
    data: {
      data: {
        attributes: route.attributes || route,
        type: 'rule-chains',
      },
    },
  };
  return fetchJSONApi(url, options);
};
