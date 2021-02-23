const fixtures = require('../fixtures/diffs/upload.js');

describe('Localhoste upload har and clickthru', function() {
  beforeEach(() => {
    cy.intercept('GET', 'flows.json').as('getFlows');
    cy.intercept('GET', 'route').as('getRoutes');
    cy.cleanupFlows();
    cy.cleanupRoutes();
    cy.fixCypressSpec(__filename);
  });

  it('Visits Localhoste, uploads har and clicks every request', function() {
    cy.visit('/');
    cy.get('.menu-item').contains('Logs').click();
    cy.wait(['@getRoutes', '@getFlows']);
    cy.get('[data-role="import-from-har"]').attachFile('upload.har');

    cy.contains('/post');

    cy.get('[data-role="logs-row"]')
      .should('have.length', 5)
      .each(($el, index) => {
        cy.wrap($el).click();
        cy.get('[data-role="log-details-modal-content"]').toMatchSnapshot();

        cy.get('[data-role="tab-headers"]').click();
        cy.get('[data-role="log-details-modal-content"]').toMatchSnapshot();

        cy.get('[data-role="select-response-phase"]').click();
        cy.get('[data-role="log-details-modal-content"]').toMatchSnapshot();

        cy.get('[data-role="tab-body"]').click();
        cy.get('[data-role="log-payload-body-diff"]').should(($div) => {
          expect($div.get(0).innerText).to.eq(fixtures.bodyRequests[index]);
        })

        cy.get('[data-role="select-response-phase"]').click();
        cy.get('[data-role="log-payload-body-diff"]').should(($div) => {
          expect($div.get(0).innerText).to.eq(fixtures.bodyResponses[index]);
        })

        cy.get('[data-role="log-details-modal"] .modal-header i.fa-times').click();
      });
  });
});
