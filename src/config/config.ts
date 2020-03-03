const config = {
  defaultRuleTokenizeHostEndpoint: '(.*)\\.verygoodproxy\\.com',
  defaultRuleDetokenizeHostEndpoint: 'echo\\.apps\\.verygood\\.systems',
  defaultRuleDestinationOverrideEndpoint: 'https://echo.apps.verygood.systems',
  echoServerURL: 'https://echo.apps.verygood.systems',
  echoServerHostname: 'echo.apps.verygood.systems',
  echoServerRegex: 'echo\.apps\.verygood\.systems', // eslint-disable-line
  dashboardLink: 'https://dashboard.verygoodsecurity.com',
  docsLink: 'https://www.verygoodsecurity.com/docs/overview',
  docsGuidesLink: 'https://www.verygoodsecurity.com/docs/guides/index',
  docsFaqLink: 'https://www.verygoodsecurity.com/docs/faq',
  docsYamlImportLink: 'https://www.verygoodsecurity.com/docs/features/yaml#import-a-single-route',
  docsVGSCLILink: 'https://www.verygoodsecurity.com/docs/cli/index',
  docsTermRouteLink: 'https://www.verygoodsecurity.com/docs/terminology/nomenclature#route',
}

export default config;