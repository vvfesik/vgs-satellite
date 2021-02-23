import {
  pick,
  cond,
  is,
  pipe,
  __,
  split,
  apply,
  path,
  curry,
  juxt,
  mergeAll,
  zipObj,
  keys,
  values,
  props as rProps,
  defaultTo,
} from 'ramda';

type IActionCreator = (dispatch: any) => Promise<any>;
type ISelector = (state: object) => { [key: string]: any };
type IModuleSelector = (state: object) => { [key: string]: any } | undefined;

type IPicker<K> = (props: Array<K | object>, state?: object) => ISelector;
type P<T> = T extends null ? string : keyof T;
type ICreatePicker = <T = null>(moduleSelector: string | string[] | IModuleSelector, initialState?: T) => IPicker<P<T>>;

export const separate = (props: Array<string | object>) => props.reduce(
  (acc: any, prop: string | object) => {
    if (is(String, prop)) {
      acc[0].push(prop);
    } else if (!is(Function, prop) && is(Object, prop)) {
      acc[1].push(prop);
    }
    return acc;
  },
  [[], []],
);

/**
 * Wraps action that returns promise and dispatches LOADING event before and after dispatching of wrapped action
 *
 * @sig (Object) => (Function) => Promise<any>
 *
 * @param {String} type - action name
 * @param {String} [target] - action payload name
 * @param {String} [customProps] - additional payload params
 * @return {Function} - function that dispatches LOADING action and wrapped action
 */
export const withLoading = (
  {
    type,
    target = 'data',
    customProps = {},
  }: { type: string, target?: string, customProps?: object },
) => {
  const loading = (isLoading: boolean) => ({
    type,
    customProps,
    [target]: isLoading,
  });

  return (wrapped: IActionCreator) => async (dispatch: any) => {
    dispatch(loading(true));
    const res = await wrapped(dispatch);
    dispatch(loading(false));
    return res;
  };
};

/**
 * Safely load and parse data from localStorage
 *
 * @param key - name used to load value from localStorage
 * @param defaultState - state returned in case of null or error
 */
export const loadFromLocalStore = (key: string, defaultState?: any) => {
  try {
    // @ts-ignore
    return JSON.parse(localStorage.getItem(key)) || defaultState;
  } catch {
    return defaultState;
  }
};

export const withPrefix = (prefixName: string) => (type: string) => `${prefixName}/${type}`;

export const createReducer = (initialState: any, handlers: any) => function reducer(state = initialState, action: any) {
  return Object.prototype.hasOwnProperty.call(handlers, action.type) ? handlers[action.type](state, action) : state;
};

/**
 * Merge result of pickers' invoking
 *
 * @sig ([Function]) => (Object) => Object
 *
 * @param {[Function]} pickers - list of functions, each gets redux state and picks props from that state
 * @return {Function} - function that takes redux state, applies it to list of pickers and merge result
 */
export const mergePickers = (pickers: ISelector[]) => pipe<any, any, any>(juxt(pickers), mergeAll);

/**
 * Creates function that allows select properties from particular module of redux state
 *
 * @sig (String | [String] | Object => Object, Object) => ([String], Object) => Object
 *
 * @param {String | [String] | Object => Object} moduleSelector - selects target property of redux state
 * @param {Object} initialState - shows schema for props validation
 * @return {Function} - function that picks props from target module
 */
// @ts-ignore
export const createPicker: ICreatePicker = (moduleSelector) => {
  const getModule: IModuleSelector = (state) => cond([
    [is(String), pipe(split('.'), path(__, state))],
    [is(Array), path(__, state)],
    [is(Function), apply(__, [state])],
  ])(moduleSelector);

  return curry((props: Array<string | object>, state: object) => {
    const [strProps, objProps] = separate(props);
    const mergedObjProps = mergeAll(objProps);
    const module = getModule(state);

    return mergePickers([
      pick(strProps),
      pipe(rProps(keys(mergedObjProps)), zipObj(values(mergedObjProps))),
    ])(module);
  });
};

/**
 * Converts array of objects to structure with list of ids and the objects stored under property `byId`
 *
 * @param {String} propName - name of property to use as an id
 * @param {[Object]} items - array of objects to convert
 * @param {Object} customProps - props to spread into final object
 * @return {Object} - object with properties `ids` and `byId`
 */
export const normalize = (propName: string, items: any[], customProps?: any) => defaultTo([], items).reduce(
  (acc, item) => {
    acc.ids.push(item[propName]);
    acc.byId[item[propName]] = item;
    return acc;
  },
  { ids: [], byId: {}, ...customProps },
);
