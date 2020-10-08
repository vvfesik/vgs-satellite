describe('Localhoste route from request flow', function() {
  beforeEach(() => {
    cy.server();
    cy.route('GET', 'flows.json').as('getFlows');
    cy.route('GET', 'route').as('getRoutes');
    cy.route('POST', 'route').as('postRoute');
    cy.cleanupFlows();
    cy.cleanupRoutes();
    cy.fixCypressSpec(__filename);
  });

  it('Creates route from request', function() {
    cy.visit('/');
    cy.wait(['@getFlows']);
    cy.get('[data-role="demo-curl"]').toMatchSnapshot();

    cy.task('viaProxy', {
      method: 'POST',
      url: 'http://httpbin.org/post',
      data: { foo: 'bar' },
    });

    cy.get('[data-role="logs-row"]').contains('/post').click();

    cy.get('[data-role="log-details-modal"]');
    cy.get('button').contains('Secure this payload').click({ force: true });
    cy.get('[data-role="quick-integration-modal"]').contains('Select the fields that you want to Redact');
    cy.get('[data-role="quick-integration-modal"] input[type="checkbox"]').click({ force: true });

    cy.get('[data-role="select-secure-payload"]').click();
    cy.get('.nav-item').contains('Outbound').click();
    cy.get('.tab-pane.active button').contains('Save route').click({ force: true });
    cy.wait('@postRoute');
    cy.get('[data-role="whats-next-stepper"]').type('{esc}');

    cy.get('.menu-item').contains('Routes').click();
    cy.wait('@getRoutes');

    cy.get('.tab-pane.active [data-role="route-item"]');
  });
});
