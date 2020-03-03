import _ from 'lodash';

export const XMLHeaders = [
  'application/xml',
  'text/xml',
  'application/xhtml+xml',
  'application/atom+xml',
];

export const JSONHeaders = [
  'application/json',
  'application/vnd.api+json',
];

export const FormDataHeaders = [
  'application/x-www-form-urlencoded',
];

export function isXML(contentType: string) {
  return _.some(XMLHeaders, header => contentType.startsWith(header));
}

export function isJSON(contentType: string) {
  return _.some(JSONHeaders, header => contentType.startsWith(header));
}

export function isFormData(contentType: string) {
  return _.some(FormDataHeaders, header => contentType.startsWith(header));
}

export function getTransformerType(contentType: string) {
  let transformer = 'UNKNOWN';

  if (isJSON(contentType)) {
    transformer = 'JSON_PATH';
  } else if (isXML(contentType)) {
    transformer = 'XPATH';
  } else if (isFormData(contentType)) {
    transformer = 'FORM_FIELD';
  }

  return transformer;
}
