import config from 'src/config/config';
import { IRoute } from 'src/redux/interfaces/routes';
import { generateRouteName } from 'src/redux/utils/utils';
import _ from 'lodash';

export const whiteListedOutboundRouteTemplate: IRoute = {
  destination_override_endpoint: '*',
  entries: [],
  host_endpoint: '(.*)',
  port: 443,
  protocol: 'http',
  source_endpoint: '*',
  transport: 'HTTP',
  type: 'rule-chains',
};

export const getRouteTemplate = (isReverse: boolean): IRoute => ({
  destination_override_endpoint: isReverse
    ? config.defaultRuleDestinationOverrideEndpoint
    : '*',
  host_endpoint: isReverse
    ? config.defaultRuleTokenizeHostEndpoint
    : config.defaultRuleDetokenizeHostEndpoint,
  port: 80,
  protocol: 'http',
  source_endpoint: '*',
  transport: 'HTTP',
  entries: isReverse ? [] : [getEntryTemplate(false)],
  tags: { name : isReverse
    ? generateRouteName(config.echoServerHostname)
    : generateRouteName(),
  },
});

export const getEntryTemplate = (isReverse: boolean) => {
  return {
    operation: isReverse ? 'REDACT' : 'ENRICH',
    phase: 'REQUEST',
    public_token_generator: 'UUID',
    targets: ['body'],
    token_manager: 'PERSISTENT',
    transformer: 'JSON_PATH',
    transformer_config: ['$.account_number'],
    filter_id: _.uniqueId(),
    config: {
      condition: 'AND',
      expression: null,
      rules: [
        {
          condition: null,
          expression: {
            field: 'PathInfo',
            type: 'string',
            operator: 'matches',
            values: '/post',
          },
          rules: null,
        },
        {
          condition: null,
          expression: {
            field: 'ContentType',
            type: 'string',
            operator: 'equals',
            values: 'application/json',
          },
          rules: null,
        },
      ],
    },
  };
};

export const getUpstreamTemplate = () => {
  return {
    host: '',
    port: '',
    username: '',
    password: '',
    credentials: [],
    private_key: '',
  };
};
