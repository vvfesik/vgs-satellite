
export function getQueryParams(queryString) {
  const hashes = queryString.slice(queryString.indexOf('?') + 1).split('&');
  const params = {};
  hashes.map((hash) => {
    const [key, val] = hash.split('=');

    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(val);
    }
  });

  return params;
}

export function findPathNameRegexp(inputPathname: string) {
  const numericID = {
    regexp: /^[0-9]+$/,
    text: '[0-9]+',
  };

  const uuid = {
    regexp: /(\/|)[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
    text: '(/|)[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
  };

  const paths = inputPathname.split('/');
  let regExpFound = false;
  for (let i = 0; i < paths.length; i++) {
    if (numericID.regexp.test(paths[i])) {
      paths[i] = numericID.text;
      regExpFound = true;
      continue;
    }
    if (uuid.regexp.test(paths[i])) {
      paths[i] = uuid.text;
      regExpFound = true;
    }
  }
  const pathname = paths.join('/');
  return { regExpFound, pathname };
}
