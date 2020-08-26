import { IRoute } from 'src/redux/interfaces/routes';

export function getProxyType(route: IRoute) {
  return route.destination_override_endpoint !== '*' ? 'Reverse' : 'Forward';
}

export function getUpstream(route: IRoute) {
  return getProxyType(route) === 'Reverse' ? route.destination_override_endpoint : route.host_endpoint;
}

export function getRouteType(route: IRoute) {
  return route.destination_override_endpoint !== '*' ? 'Inbound' : 'Outbound';
}
