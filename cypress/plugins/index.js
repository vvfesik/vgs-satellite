/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
const { initPlugin } = require('cypress-plugin-snapshots/plugin');
const axios = require('axios');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  initPlugin(on, config);
  require('@cypress/code-coverage/task')(on, config);
  on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'));

  on('task', {
    viaProxy ({ method, url, data, headers = { 'Content-type': 'application/json' } }) {
      axios({
        url,
        data,
        method,
        headers,
        proxy: {
          host: '127.0.0.1',
          port: 9099,
        },
      });
      return null;
    }
  });

  return config;
};
