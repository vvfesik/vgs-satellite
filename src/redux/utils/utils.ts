import moment from 'moment';
import classnames from 'classnames';
import parseUrl from 'url-parse';
import randomId from './random-id';
import { volatileRulesRegex } from 'src/data/regex';
import { includes } from 'lodash';
import { ILog } from 'src/redux/interfaces/logs';

export function formatDate(date) {
  if (moment().isSame(date, 'day')) {
    return moment.utc(date).local().format('[Today] HH:mm:ss');
  } else {
    return moment.utc(date).local().format('YYYY-MM-DD HH:mm:ss');
  }
}

export function unixToFormat(dateUnix: number, format?: string) {
  return moment.unix(dateUnix).format(format);
}

export function dateFromNow(date) {
  return moment(date).fromNow();
}

export function nowBeforeDate(date) {
  return moment().isBefore(date);
}

export function isVolatile(name) {
  return name.match(volatileRulesRegex);
}

export function badgeColor(statusCode) {
  return classnames({
    danger: statusCode >= 500,
    success: statusCode >= 200 && statusCode <= 299,
    secondary: statusCode >= 300 && statusCode <= 399,
    warning: statusCode >= 400 && statusCode <= 499,
  });
}

export function isEqual(stringOne: string, stringTwo: string) {
  return stringOne.toLowerCase() === stringTwo.toLowerCase();
}

export function getQueryParameters(url: string) {
  return parseUrl(url).query;
}

export const generateRouteName = (hostname?: string) => {
  const routeName = randomId();
  return routeName;
};

export function constructUriFromLog(log: ILog) {
  const isPathSufficient = !!log.path?.match(/^(https?:)\/\//);
  const isPathAppendable = !log.upstream?.match(/\/$/) && !!log.path?.match(/^\//);
  const isPathPrependable = !!log.scheme && !log.upstream.startsWith(`${log.scheme}:`) && !log.upstream?.match(/^\//);
  return isPathSufficient
    ? log.path
    : `${isPathPrependable ? log.scheme + '://' : ''}${log.upstream ?? ''}${isPathAppendable ? log.path : ''}`;
}

export const getFiltersWithoutOperations = (route: IRoute) => route.entries.filter(entry => !entry.operations);

export function isValidHostname(hostname: string) {
  const hostnameRegex = /^\s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.{1,}[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?){1,}?)\s*$/; // tslint:disable-line
  return hostnameRegex.test(hostname);
}

export const hostFromUri = (destOverride: string) => {
  const url = new URL(destOverride);
  return url.hostname;
};

export const hostnameFromUri = (destOverride: string) => destOverride.replace(/^(.*\/\/)/, '');

export function removeQueryParameters(url: string) {
  const queryParameter = parseUrl(url).query;
  return url.replace(queryParameter, '');
};

export const isOperatorExist = (rules: any, operator: string) => includes(rules.map(rule => rule.operator), operator);

export function isJSON(data) {
  try {
    JSON.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function getOperationsName(operations: string) {
  const operationsJson = isJSON(operations) && JSON.parse(operations);
  if (Array.isArray(operationsJson)) {
    const operationsArray = operationsJson.map(op => op['@type']);
    return operationsArray.join(', ').replace(/(type\.googleapis\.com\/)|(Config)/g, '');
  } else {
    return '';
  }
}

export function isRegExp(value: string) {
  if (!value) {
    return true;
  }
  try {
    const regExp = new RegExp(value);
    return true;
  } catch (e) {
    return false;
  }
}
