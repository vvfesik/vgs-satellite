export interface IEntryConfigExpression {
  field: string;
  type: string;
  operator: string;
  values: string[];
}

export interface IEntryConfigRule {
  condition?: string | null;
  expression?: IEntryConfigExpression | null;
  rules?: IEntryConfigRule[] | null;
}

export interface IEntryConfig {
  condition?: string | null;
  expression?: IEntryConfigExpression | null;
  rules: IEntryConfigRule[];
}

export interface IClassifiers {
  TAGS?: string[];
  INCLUDE?: string[];
  EXCLUDE?: string[];
}

export interface IOperationV2 {
  name: string;
  parameters: {
    code: string;
  };
}

export interface IEntry {
  id: string;
  operation: string;
  transformer: string;
  transformer_config: string[];
  transformer_config_map: ITransformerConfigMap;
  public_token_generator: string;
  token_manager: string;
  phase: string;
  targets: string[];
  config: IEntryConfig;
  classifiers: IClassifiers;
  operations_v2?: IOperationV2[];
}

export interface ITransformerConfigMap {
  patterns: string[];
  charset?: string;
}

export interface IRoute {
  id?: string;
  entries: IPartialEntry[];
  updated_at?: string;
  destination_override_endpoint: string;
  host_endpoint: string;
  upstreamUrl?: string;
  protocol: string;
  tags: IRouteTags;
  source_endpoint: string;
  port?: number;
  transport?: string;
  type?: string;
}

export interface IRouteTags {
  name: string;
  integration?: string;
  source?: string;
}

export interface IUpstream {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  credentials: string[];
  private_key: string;
}

export type IPartialEntry = Partial<IEntry>;

export type IPartialRoute = Partial<IRoute>;
export type TRouteType = 'Inbound' | 'Outbound';

export interface IRouteTemplate {
  key: string;
  title: string;
  type: string;
  mdLink?: string;
  yamlLink?: string;
  md?: string;
  yaml?: string;
}

export interface IRouteTemplateList {
  [name: string]: IRouteTemplate;
}

export type IRouteTemplateFilter = 'all' | 'inbound' | 'outbound';

export interface IGitApiRouteTemplateResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface IRouteTemplatesState {
  list: IRouteTemplateList;
  isListLoading: boolean;
  isDetailsLoading: boolean;
  selectedKey: string | null;
}

export interface IRoutesState {
  isLoading: boolean;
  list: IRoute[];
  currentRoute: IRoute | null;
  isSaveInProgress: boolean;
  routeTemplates: IRouteTemplatesState;
  createdRoute: IRoute | null;
  routeConfirmDeleteModal: {
    isOpen: boolean;
    route: IRoute | null;
  };
}
