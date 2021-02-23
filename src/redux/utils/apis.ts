import axios, { AxiosError, AxiosResponse } from 'axios';
import Qs from 'qs';
import trimFields from 'src/redux/utils/trim-attrs';
import { notify, FETCH_FAILED_ERROR_TEXT } from 'src/redux/utils/notifications';
import _ from 'lodash';
import { isJSON } from 'src/redux/utils/data.util';
import history from 'src/redux/utils/history';
import { refreshIfExpired } from 'src/redux/modules/auth';

interface IHeadersOverride { [key: string]: string | boolean | number; }
interface IFetchHandlers { onSuccess?: (res: AxiosResponse) => any; onError?: (err: AxiosError) => any; }
interface IOptions { headers?: IHeadersOverride; handlers?: IFetchHandlers; }
interface IModel {
  id: string;
  attributes: Record<string, string>;
  links?: Record<string, string>;
  type?: string;
  included?: IModel[];
  meta?: Record<string, string>;
  relationships?: Record<string, { links: {related: string, self: string} }>;
}
interface IModelJSON extends Omit<IModel, 'id' | 'attributes' | 'included' >{
  data?: {id: IModel['id'], [key: string]: string };
  included?: IModelJSON[];
}

const VGSApi = axios.create({
  paramsSerializer(params) {
    return Qs.stringify(params, { arrayFormat: 'brackets', encode: false });
  },
});

export const fetchApi = async (url: string, options: any) => {
  let params = { ...options, url };
  if (options && !options.noTrim) params = trimFields({ ..._.cloneDeep(options), url });

  if (params.body) {
    params.body = JSON.stringify(params.body);
  }

  if (params.headers && params.headers.Authorization === 'Bearer [TOKEN]') {
    params.headers.Authorization = `Bearer ${await refreshIfExpired(params.headers['[CLIENT]'])}`;
    delete params.headers['[CLIENT]'];
  }

  return VGSApi.request(params);
};

export function modelToJson(model: IModel, noTrim = false): IModelJSON {
  if (model) {
    if (!noTrim) model.attributes = trimFields(model.attributes);
    return {
      data: { ...model.attributes, id: model.id },
      links: model.links,
      type: model.type,
      included: model.included?.map((m: IModel) => modelToJson(m, noTrim)) || [],
      meta: model.meta || {},
      relationships: model.relationships || {},
    };
  }
  return {};
}

export function handleRequestSuccess(response: AxiosResponse, { noResponseTrim: noTrim = false } = {}) {
  if (Array.isArray(response.data.data)) {
    if (response.data.data.length > 0 && response.data.data[0].type === 'vaults') {
      return {
        data: response.data.data.map((m: IModel) => modelToJson(m, noTrim)),
        meta: response.data.meta,
        links: response.data.links,
      };
    }
    if (response.data.data.length > 0 && response.data.data[0].attributes) {
      return {
        data: response.data.data.map((m: IModel) => ({ ...m.attributes, id: m.id })),
        meta: response.data.meta,
        links: response.data.links,
      };
    }
    return {
      data: response.data.data,
      meta: response.data.meta,
      links: response.data.links,
    };
  }
  return modelToJson(
    {
      ...response.data.data,
      included: response.data.included,
      links: response.data.data
        ? response.data.data.links
        : response.data.links,
    },
    noTrim,
  );
}

// TODO check whether handleRequestError used with non-axios request functions
export function handleRequestError(error: AxiosError & {status?: number, message?: string}) {
  if (error.response) {
    let errorMessage;

    const errorResponse = _.get(error, 'response.data.errors[0]') || _.get(error, 'message');

    if (errorResponse && errorResponse.code || (errorResponse.status && errorResponse.title && errorResponse.detail)) {
      // handling for JSONApi style
      if (isJSON(errorResponse.detail)) {
        errorResponse.detail = JSON.parse(errorResponse.detail)[0].errorMessage;
      }
      errorMessage = {
        title: `${errorResponse.status || errorResponse.code} ${errorResponse.title}`,
        message: errorResponse.detail,
      };
    } else if (_.get(error, 'response.data.message')) {
      // handling for 'JSONApi' style
      errorMessage = error.response.data.message;
    } else {
      // fallback
      errorMessage = FETCH_FAILED_ERROR_TEXT;
    }

    notify.error(errorMessage);
  } else {
    notify.error(typeof error.request === 'string'
      ? error.request
      : error.message);
  }

  if (error.status === 401 || error.response?.status === 401) {
    setTimeout(
      () => history.push('/logout'),
      1000,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw error.message || JSON.stringify(error);
}

export const fetchJSONApi = (
  url: string,
  options: any,
  handlers?: IFetchHandlers,
) => {
  const { noResponseTrim = false } = options || {};
  const handleRequestSuccessOpts = (response: AxiosResponse) => handleRequestSuccess(response, { noResponseTrim });
  return fetchApi(url, options)
    .then(handlers?.onSuccess || handleRequestSuccessOpts)
    .catch(handlers?.onError || handleRequestError);
};

export function makeHeaders(override?: IHeadersOverride) {
  const headers: any = {
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
    Authorization: 'Bearer [TOKEN]',
    ...override,
  };
  return headers;
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getData = (url: string, options: IOptions = {}) => fetchJSONApi(url, { method: 'GET', headers: makeHeaders(options.headers) }, options.handlers);
export const postData = (url: string, data: object, options: IOptions = {}) => fetchJSONApi(url, { data: { data }, method: 'POST', headers: makeHeaders(options.headers) }, options.handlers);
export const putData = (url: string, data: object, options: IOptions = {}) => fetchJSONApi(url, { data: { data }, method: 'PUT', headers: makeHeaders(options.headers) }, options.handlers);
export const patchData = (url: string, data: object, options: IOptions = {}) => fetchJSONApi(url, { data: { data }, method: 'PATCH', headers: makeHeaders(options.headers) }, options.handlers);
export const deleteData = (url: string, data: object = {}, options: IOptions = {}) => fetchJSONApi(url, { data, method: 'DELETE', headers: makeHeaders(options.headers) }, options.handlers);
