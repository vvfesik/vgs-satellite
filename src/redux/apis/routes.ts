import axios from 'axios';
import config from 'src/config/config';
import { IRoute } from 'src/redux/interfaces/routes';

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
