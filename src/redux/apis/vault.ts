import config from 'src/config/config';
import { fetchJSONApi, makeHeaders } from 'src/redux/utils/apis';

export function getAllVaults() {
  const url = `${config.dashboardApiHost}/vaults`;
  const params = {
    headers: makeHeaders(),
  };
  return fetchJSONApi(url, params);
}
