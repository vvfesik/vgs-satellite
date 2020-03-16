import { getQueryParams } from 'src/redux/utils/url.util';
import { isXML, isJSON, isFormData } from 'src/redux/utils/data.util';
import config from 'src/config/config';
import { getProxyType } from 'src/redux/utils/routes';
import _ from 'lodash';
import parser from 'fast-xml-parser';
import { generateRouteName } from 'src/redux/utils/utils';

function isVolatile(name) {
  // disabled temporarily
  return false;
  /*
  if(!name) return false;
  return name.includes('cvv') || name.includes('cvc');
  */
}

function is6t4(name) {
  // disabled temporarily
  return false;
  /*
  if(!name) return false;
  return name.includes('card');
  */
}

function createNode(props, operation) {
  return Object.assign({
    operation,
    toggled: true,
    tokenManager: isVolatile(props.path) ? 'VOLATILE' : 'PERSISTENT',
    publicTokenGenerator: is6t4(props.path) ? 'FPE_SIX_T_FOUR' : 'UUID',
  },                   props);
}

export function traverse(parent, parentPath, delimiter, operation, shiftKey = 0) {
  return _.map(parent, (value, key) => {
    let path;
    const normalizeKey = key + shiftKey;

    if (_.isObject(value) || _.isArray(value)) {
      path = parentPath + (_.isArray(parent) ? `.[${normalizeKey}]` : delimiter + key);
      return createNode({
        name: key,
        children: traverse(value, path, delimiter, operation, shiftKey),
      },                operation);
    } else {
      path = parentPath + (_.isArray(parent) ? `[${normalizeKey}]` : delimiter + key);
      return createNode({
        path,
        name: `${key}: ${value}`,
        selected: false,
        last: true,
      },                operation);
    }
  });
}

export const buildTree = (log, isReverse) => {
  const { body, contentType } = log.data.value;
  let tree;
  const operation = isReverse ? 'REDACT' : 'ENRICH';

  try {
    if (isJSON(contentType)) {
      try {
        tree = traverse(JSON.parse(body), '$', '.', operation);
      } catch (e) {
        tree = { errors: `Error in request body: ${e.message}` };
      }
    } else if (isXML(contentType)) {
      tree = traverse(parser.parse(body, { ignoreNameSpace : true }), '', '/', operation, 1);
    } else if (isFormData(contentType)) {
      tree = traverse(getQueryParams(body), '', '', operation);
    } else {
      tree = [];
      // tslint:disable-next-line
      console.error('Wrong data');
    }
  } catch (e) {
    tree = { errors: `Wrong data ${e}` };
  }

  return tree;
};

function parsePayload(payload) {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch (e) {
    return payload;
  }
}

export const getParsedLogValue = (harEntry, selectedPhase?: 'REQUEST' | 'RESPONSE') => {
  // request
  const requestHeaders = harEntry.request.headers;
  const requestDataString = parsePayload(
    (harEntry.request.postData || harEntry.request.putData).text,
  );

  // response
  const responseHeaders = harEntry.response.headers;
  const status = harEntry.response.status === -1 ? '' : harEntry.response.status;
  const isSuccess = (status >= 200 && status <= 299);
  const responseDataString = parsePayload(harEntry.response.content.text);

  const phase = selectedPhase || 'REQUEST';
  let contentType = harEntry[phase.toLowerCase()].headers
    .find(header => header.name.toLowerCase() === 'content-type');
  if (contentType) {
    contentType = contentType.value;
  } else {
    contentType = '';
  }

  const isReverse = harEntry.request.headers
    .find(h => h.name.startsWith('X-Forwarded'));

  const headers = {};
  harEntry[phase.toLowerCase()].headers
    .forEach((header) => {
      headers[header.name] = header.value;
    });

  const body =
    phase.toLowerCase() === 'response' && !!status
      ? harEntry.response.content.text
      : (harEntry.request.postData || harEntry.request.putData).text;

  return {
    phase,
    contentType,
    isReverse,
    headers,
    body,
    isResponse: !!status,

    request: {
      method: harEntry.request.method,
      date: harEntry.startedDateTime,
      body: requestDataString,
      headers: requestHeaders,
      size: harEntry.request.bodySize,
      httpVersion: harEntry.request.httpVersion,
      url: harEntry.request.url,
    },

    response: {
      status,
      isSuccess,
      body: responseDataString,
      headers: responseHeaders,
      size: harEntry.response.content && harEntry.response.content.size,
      httpVersion: harEntry.response.httpVersion,
      statusText: harEntry.response.statusText,
      isEmptyStatus: status === '',
    },
  };
};

export const getDummyEntry = isReverse => ({
  targets: ['body'],
  phase: 'REQUEST',
  operation: isReverse ? 'REDACT' : 'ENRICH',
  id_selector: null,
  operations: null,
  config: {
    expression: null,
    condition: 'AND',
    rules: [
      {
        condition: null,
        rules: null,
        expression: {
          field: 'PathInfo',
          type: 'string',
          operator: 'equals',
          values: [''],
        },
      },
    ],
  },
});

export const getQuickIntegrationReverseRouteTemplate = (destination_override_endpoint = '') => ({
  destination_override_endpoint,
  protocol: 'http',
  host_endpoint: config.defaultRuleTokenizeHostEndpoint,
  transport: 'HTTP',
  source_endpoint: '',
  entries: [],
  tags: { name : destination_override_endpoint
      ? generateRouteName(destination_override_endpoint)
      : generateRouteName(),
  },
});

export const getQuickIntegrationForwardRouteTemplate = (host_endpoint = config.defaultRuleDetokenizeHostEndpoint) => ({
  host_endpoint,
  destination_override_endpoint: '*',
  port: 443,
  protocol: 'http',
  source_endpoint: '*',
  transport: 'HTTP',
  entries: [],
  tags: { name : generateRouteName() },
});

export function getReverseRoute(routes, parsedUrl) {
  const reverseRoute = routes.find((route) => {
    const hostCheck = route.destination_override_endpoint.includes(parsedUrl.host);

    return hostCheck && getProxyType(route) === 'Reverse';
  });

  return reverseRoute
    ? reverseRoute
    : getQuickIntegrationReverseRouteTemplate(parsedUrl.origin);
}

export function getForwardRoute(routes, parsedUrl) {
  const formatedUrl = parsedUrl.host.replace(/\./gm, '\\.');

  const routeWithSameHost = routes.find((route) => {
    const forwardCheck = route.host_endpoint === formatedUrl;
    return getProxyType(route) === 'Forward' && forwardCheck;
  });

  return routeWithSameHost || getQuickIntegrationForwardRouteTemplate(formatedUrl);
}
