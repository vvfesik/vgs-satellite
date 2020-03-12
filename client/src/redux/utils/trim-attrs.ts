import { isString, isArray, isObject } from 'lodash';

function trimArray(data: any[]) {
  return data.map((el: any) => {
    if (isString(el)) {
      return el.trim();
    } else if (isArray(el)) {
      return trimArray(el);
    } else if (isObject(el)) {
      trimFields(el);
    }

    return el;
  });
}

export default function trimFields(data: any) {
  if (data) {
    for (const key in data) {
      if (isString(data[key])) {
        data[key] = data[key].trim();
      } else if (Array.isArray(data[key])) {
        data[key] = trimArray(data[key]);
      } else if (isObject(data[key])) {
        trimFields(data[key]);
      }
    }
  }
  return data;
}
