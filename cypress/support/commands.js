import 'cypress-file-upload';
import 'cypress-plugin-snapshots/commands';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('cleanupRoutes', () => {
  cy.request('http://localhost:8089/route')
    .then((response) => {
      response.body.forEach((route) => {
        cy.request('DELETE', `http://localhost:8089/route/${route.id}`);
      });
    });
});

Cypress.Commands.add('cleanupFlows', () => {
  cy.request('http://localhost:8089/flows.json')
    .then((response) => {
      response.body.forEach((flow) => {
        cy.request('DELETE', `http://localhost:8089/flows/${flow.id}`);
      });
    });
});

// https://github.com/meinaart/cypress-plugin-snapshots/issues/10#issuecomment-610639709
Cypress.Commands.add('fixCypressSpec', filename => {
  const path = require('path');
  const relative = filename.substr(1); // removes leading "/"
  const projectRoot = Cypress.config('projectRoot');
  const absolute = path.join(projectRoot, relative);
  Cypress.spec = {
    absolute,
    name: path.basename(filename),
    relative,
  };
});
