import moment from 'moment';
import classnames from 'classnames';
import parseUrl from 'url-parse';
import { volatileRulesRegex } from 'src/data/regex';
import { ILog, ILogFilters } from 'src/redux/interfaces/logs';
import { IRoute, IEntry } from 'src/redux/interfaces/routes';
import randomId from './random-id';

export function formatDate(date) {
  if (moment().isSame(date, 'day')) {
    return moment.utc(date).local().format('[Today] HH:mm:ss');
  } else {
    return moment.utc(date).local().format('YYYY-MM-DD HH:mm:ss');
  }
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

export function mapMatchingFilters(
  routes: IRoute[],
  logFilters: ILogFilters,
) {
  if (logFilters && logFilters.filters && !!logFilters.filters.length) {
    const matchingFilters = []
      .concat(
        ...routes.map(route =>
          logFilters.filters.map((f) => {
            const matchedFilter = route.entries.find(
              entry => entry.id === f.filter_id,
            );
            return matchedFilter && matchedFilter.id;
          }),
        ),
      )
      .filter(el => el != null);
    return matchingFilters;
  } else {
    return [];
  }
}

export function badgeColor(statusCode) {
  return classnames({
    danger: statusCode >= 500,
    success: statusCode >= 200 && statusCode <= 299,
    secondary: statusCode >= 300 && statusCode <= 399,
    warning: statusCode >= 400 && statusCode <= 499,
  });
}

export function flatExpressions(filterRule) {
  const allExpressions = (rule) => {
    const arr = [];
    if (!!rule.expression && rule.expression.field) {
      arr.push(rule.expression.field);
    }
    if (rule.rules && !!rule.rules.length) {
      rule.rules.forEach((innerRule) => {
        arr.push(allExpressions(innerRule));
      });
    }
    return arr;
  };

  return uniq(flattenDeep(allExpressions(filterRule)))
    .toString()
    .replace(/,/g, ', ');
}

export function matchedInActivePhase(entries: IEntry[], activePhase: string) {
  return entries.find(entry => entry.phase.toLowerCase() === activePhase);
}

export function isEqual(stringOne: string, stringTwo: string) {
  return stringOne.toLowerCase() === stringTwo.toLowerCase();
}

export function isInCollection(id: string, arr?: any[]) {
  if (arr && arr.find(obj => obj.id === id)) {
    return true;
  } else return false;
}

export function getQueryParameters(url: string) {
  return parseUrl(url).query;
}

export const generateRouteName = (hostname?: string) => {
  const routeName = randomId();
  // return hostname ? `${hostname}-${routeName}` : routeName;
  return routeName;
};

export function constructUriFromLog(log: ILog) {
  const isPathSufficient = !!log.path?.match(/^(https?:)\/\//);
  const isPathAppendable = !log.upstream?.match(/\/$/) && !!log.path?.match(/^\//);
  return isPathSufficient
    ? log.path
    : `${log.upstream ?? ''}${isPathAppendable ? log.path : ''}`;
}
