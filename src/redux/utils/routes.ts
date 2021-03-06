import config from 'src/config/config';
import { IRoute, IEntry, IPartialEntry, IEntryConfig, IEntryConfigRule } from 'src/redux/interfaces/routes';
import { isEmpty, pipe } from 'ramda';
import { omit } from 'lodash';
import { diff } from 'deep-object-diff';
import { convertRules, remapRule, unmapRule } from 'src/redux/utils/query-builder';

export function getProxyType(route: IRoute) {
  return route.destination_override_endpoint !== '*' ? 'Reverse' : 'Forward';
}

export function getUpstream(route: IRoute) {
  return getProxyType(route) === 'Reverse' ? route.destination_override_endpoint : route.host_endpoint;
}

export function getRouteType(route: IRoute) {
  return route.destination_override_endpoint !== '*' ? 'Inbound' : 'Outbound';
}

export function isInbound(route: IRoute) {
  return getProxyType(route) === 'Reverse';
}

export function getRouteProtocol(route: IRoute) {
  const protocol = route.protocol.toLowerCase();
  return protocol === 'http' || protocol === 'https' ? 'routes' : 'sftp';
}

export function isMultipleInboundWarning(routes: IRoute[], isNewRoute: boolean): boolean {
  // looking for routes with default host
  const numRoutes = routes.filter(isInbound).filter((route: IRoute) => {
    return route.host_endpoint === config.defaultRuleTokenizeHostEndpoint;
  }).length;

  const compareNumber = isNewRoute ? 1 : 2;

  return numRoutes >= compareNumber;
}

export function isValidPdfOperation(operation: string) {
  if ((operation.match(/:/g) || []).length === 1) {
    const operationArray = operation.split(':');
    const positionRegex = new RegExp('^\\s?(\\d+)(\.\\d+)?\\s?\,\\s?(\\d+)(\.\\d+)?(\\s?\,\\s?([1-9][0-9]*)+(\.\\d+)?){2}$');
    const pagesRegexp = new RegExp('^(\\s?\\*\\s?)$|^\\s?([1-9][0-9]*)\\s?((\,\\s?([1-9][0-9]*)\\s?)+)?$');
    return positionRegex.test(operationArray[0]) && pagesRegexp.test(operationArray[1]);
  } else {
    return false;
  }
}

export function isPdfValid(entries: IPartialEntry[]) {
  return !entries.some(entry => entry.transformer === 'PDF_METADATA_TOKEN' && entry.isValid === false);
}

export function convertEntries(entries: IEntry[]) {
  return entries.map((entry: IEntry) => {
    entry.config = pipe(convertRules, remapRule, unmapRule)(entry.config);
    return omit(entry, 'isValid', 'id', 'filter_id', 'removing', 'type');
  });
}

export function prepareRouteForDiff(route: IRoute, routeState: IRoute, savedRoute: IRoute) {
  let originalRoute;

  if (routeState) {
    originalRoute = {
      ...routeState,
      entries: convertEntries(routeState.entries.filter(entry => !entry.removing)),
    };
  } else {
    originalRoute = {
      ...savedRoute,
      entries: convertEntries(savedRoute.entries),
    };
  }

  const updatedRoute = {
    ...route,
    entries: convertEntries(route.entries.filter(entry => !entry.removing)),
  };

  delete originalRoute.updated_at;
  delete updatedRoute.updated_at;

  return { originalRoute, updatedRoute };
}

export function getRouteDiffOnOpen(route: IRoute, newRoute: IRoute, oldRoute: IRoute) {
  const { originalRoute, updatedRoute } = prepareRouteForDiff(route, newRoute, oldRoute);
  const routeDiff = diff(originalRoute, updatedRoute);
  return isEmpty(routeDiff);
}

export const normalizeEntryConfigRules = (rules: IEntryConfigRule[]): IEntryConfigRule[] => rules.map((rule) => ({
  ...rule,
  condition: rule.condition || null,
  expression: rule.expression || null,
  rules: rule.rules ? normalizeEntryConfigRules(rule.rules) : null,
}));

export const normalizeEntryConfig = (config: IEntryConfig): IEntryConfig => ({
  ...config,
  condition: config?.condition || null,
  expression: config?.expression || null,
  rules: config?.rules ? normalizeEntryConfigRules(config.rules) : [],
});

export const normalizeEntries = (entries: IPartialEntry[], backupRoute?: IRoute): IPartialEntry[] => entries.map((entry) => ({
  ...entry,
  id_selector: entry.id_selector || backupRoute?.entries?.find((e) => e.id === entry.id)?.id_selector || null,
  config: normalizeEntryConfig(entry.config),
}));

export const normalizeRoute = (route: IRoute, backupRoute?: IRoute): IRoute => ({
  ...route,
  ordinal: route?.ordinal || backupRoute?.ordinal || null,
  updated_at: route?.updated_at || route?.created_at || null,
  entries: normalizeEntries(route?.entries || [], backupRoute),
});
