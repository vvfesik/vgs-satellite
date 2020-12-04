describe('Localhoste eventlogs', function() {
  beforeEach(() => {
    cy.server();
    cy.route('GET', 'flows.json').as('getFlows');
    cy.cleanupFlows();
    cy.fixCypressSpec(__filename);
  });

  it('Check eventlogs tab', function() {
    cy.visit('/');
    cy.wait(['@getFlows']);
    cy.get('[data-role="demo-curl"]').toMatchSnapshot();

    cy.task('viaProxy', {
      method: 'POST',
      url: 'http://httpbin.org/post',
      data: { foo: 'bar' },
    });

    cy.get('[data-role="logs-row"]').should('have.length', 1);
    cy.get('[data-role="logs-row"] .badge-success').contains('200');
    cy.get('[data-role="logs-row"]').contains('/post').click();

    cy.get('[data-role="tab-events"]').click();

    cy.get('.eventlogs-table [data-role="event-name"]')
      .each(($el) => {
        cy.wrap($el).toMatchSnapshot();
        cy.wrap($el).click();
        cy.wrap($el).parents('.ant-table-row-level-0').next().children().toMatchSnapshot();
        cy.wrap($el).click();
      });
  });
});
