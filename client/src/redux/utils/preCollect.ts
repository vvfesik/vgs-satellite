import { get } from 'lodash';

export function harToFlow(harEntry) {
  const requestPost = get(harEntry, 'request.postData.text');
  const responsePost = get(harEntry, 'response.content.text');
  const contentType = get(harEntry, 'request.postData.mimeType');

  return Object.assign(harEntry, {
    flow: {
      request: {
        headers: harEntry.request.headers.map(h => [h.name, h.value]),
        body: requestPost,
      },
      response: {
        headers: harEntry.response.headers.map(h => [h.name, h.value]),
        body: responsePost,
      },
    },
    data: {
      value: { contentType, body: requestPost },
    },
  });
}

export function harToLog(harEntry, routeType) {
  return Object.assign(harEntry, {
    path: harEntry.request.url,
    status: harEntry.request.status,
    occurred_at: harEntry.startedDateTime,
    expired_at: harEntry.startedDateTime,
    route_type: routeType,
    proxy_status: harEntry.response.status,
    routes: {
      data: [],
    },
    http: {
      method: harEntry.request.method,
    },
  });
}
