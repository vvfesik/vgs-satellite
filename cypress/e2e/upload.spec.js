describe('Localhoste upload har and clickthru', function() {
  beforeEach(() => {
    cy.server();
    cy.route('GET', 'flows.json').as('getFlows');
    cy.route('GET', 'route').as('getRoutes');
    cy.cleanupFlows();
    cy.cleanupRoutes();
    cy.fixCypressSpec(__filename);
  });

  it('Visits Localhoste, uploads har and clicks every request', function() {
    cy.visit('/');
    cy.wait(['@getRoutes', '@getFlows']);
    cy.get('[data-role="import-from-har"]').attachFile('upload.har');

    cy.contains('/post');

    cy.get('[data-role="logs-row"]')
      .should('have.length', 5)
      .each(($el) => {
        cy.wrap($el).click();
        cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

        cy.get('[data-role="tab-headers"]').click();
        cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

        cy.get('[data-role="select-response-phase"]').click();
        cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

        cy.get('[data-role="tab-body"]').click();
        cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

        cy.get('[data-role="select-response-phase"]').click();
        cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

        cy.get('[data-role="log-details-modal"] .modal-header i.fa-times').click();
      });
  });
});
