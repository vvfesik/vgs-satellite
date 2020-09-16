
const labelValueMapper = (val) => ({
  label: val,
  value: val,
});

function getContentTypes() {
  return [
    '',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'application/xml',
    'text/xml',
    'application/json',
    'application/vnd.api+json',
    'text/javascript',
    'application/xhtml-xml',
    'text/html',
    'text/plain',
    'application/pdf',
    'text/csv',
  ].map(labelValueMapper);
}

function getHttpMethods() {
  return ['', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']
    .map(labelValueMapper);
}
export default [
  {
    name: 'Method',
    label: 'HTTP Method',
    type: 'string',
    values: getHttpMethods(),
  },
  {
    name: 'ContentType',
    label: 'ContentType',
    type: ['string', 'media_type'],
    values: getContentTypes(),
  },
  {
    name: 'PathInfo',
    type: 'string',
    label: 'PathInfo',
  },
  {
    name: 'Status',
    label: 'Status',
    type: 'number',
  },
];

export const sftpFields = [
  {
    name: 'filePath',
    label: 'filePath',
    type: 'string',
  },
];
