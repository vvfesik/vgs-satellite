describe('Localhoste upload yaml to dashboard', function() {

  it('Visits dashboard and uploads Localhoste YAML', function() {
    cy.visit(`https://dashboard.${Cypress.env('VGS_DASHBOARD_DOMAIN')}`);
    cy.url().should('contain', `auth.${Cypress.env('VGS_DASHBOARD_DOMAIN')}`);

    cy.get('#username').type(Cypress.env('VGS_DASHBOARD_EMAIL'));
    cy.get('#password').type(Cypress.env('VGS_DASHBOARD_PASS'), { parseSpecialCharSequences: false });
    cy.get('button[type="submit"]').contains('Log In').click();
    cy.url({ timeout: 60000 }).should('contain', '/dashboard/v/');

    cy.get('[data-role="open-vault-list"]').click();
    cy.get('[data-role="vault-list-contents"]').within(() => {
      cy.get('input').should('have.attr', 'placeholder', 'search…').type('satellite');
      cy.get('.vault-list__item__name').contains('satellite').click();
    });

    cy.get('[data-role="vault-menu"] a').contains('Routes').click();
    cy.get('[data-role="new-route-dropdown"]', { timeout: 30000 }).click();
    cy.get('[data-role="import-from-yaml"]').attachFile('upload-inbound.yaml');

    cy.url({ timeout: 60000 }).should('contain', '/edit');
    cy.get('.iziToast-color-green').contains('Route created successfully');
    
    cy.get('[data-role="edit-route-delete-button"]').click();
    cy.get('[data-role="modal-submit-button"]').contains('Delete').click();
    cy.get('[data-role="new-route-dropdown"]', { timeout: 30000 });
  });
});
