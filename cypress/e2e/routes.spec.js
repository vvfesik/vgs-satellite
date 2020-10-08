describe('Localhoste route flow', function() {

  beforeEach(() => {
    cy.server();
    cy.route('GET', 'route').as('getRoutes');
    cy.route('PUT', 'route/**').as('putRoute');
    cy.route('DELETE', 'route/**').as('deleteRoute');
    cy.cleanupRoutes();
    cy.fixCypressSpec(__filename);
  });

  it('Visits Localhoste, imports route, then updates and deletes it', function() {
    cy.visit('/routes');
    cy.wait('@getRoutes');
    
    cy.get('[data-role="routes-container"]').contains('There are currently no routes');
    cy.get('[data-role="import-from-yaml"]').attachFile('outbound-redact.yaml');
    cy.wait(['@putRoute', '@getRoutes']);
    cy.url().should('contain', '/edit');
    cy.get('[data-role="edit-route-form"]');

    cy.visit('/routes');
    cy.wait('@getRoutes');

    cy.get('[data-role="routes-type-switch"]').contains('Inbound').click();
    cy.get('[data-role="routes-container"] .tab-pane.active').contains('No Inbound routes');
    
    cy.get('[data-role="routes-type-switch"]').contains('Outbound').click();
    cy.get('[data-role="routes-container"] .tab-pane.active [data-role="route-item"]');

    cy.get('[data-role="routes-type-switch"]').contains('All').click();
    cy.get('[data-role="routes-container"] .tab-pane.active').contains('No Inbound routes');
    cy.get('[data-role="routes-container"] .tab-pane.active [data-role="route-item"]');
    
    cy.get('.route-item .filter-toggler').first().click();

    cy.get('[data-role="route-item"] button').contains('Manage').click({ force: true });
    cy.url().should('contain', '/edit');
    cy.get('[data-role="edit-route-name"]').clear().type('test-basic-redact-renamed');
    cy.get('[data-role="edit-route-save-button"]').click();
    cy.get('.diffsnippet').contains('name: test-basic-redact-renamed');
    cy.get('[data-role="apply-route-changes"]').click();
    cy.wait(['@putRoute', '@getRoutes']);
    cy.get('.iziToast').contains('Your route was updated');

    cy.get('[data-role="edit-route-delete-button"]').click();
    cy.get('[data-role="route-delete-confirm-modal"]').toMatchSnapshot();
    cy.get('[data-role="close-modal"]').click();
    cy.get('button').contains('Cancel').click({ force: true });
    cy.wait('@getRoutes');

    cy.get('[data-role="route-item-name-value"]').contains('test-basic-redact-renamed');
    cy.get('[data-role="route-item"] button').contains('Delete route').click({ force: true });
    cy.contains('delete this route?');
    cy.get('[data-role="route-delete-confirm-modal"]').toMatchSnapshot();

    cy.get('[data-role="modal-submit-button"]').contains('Delete').click();
    cy.wait(['@deleteRoute', '@getRoutes']);

    cy.contains('There are currently no routes');
  });
});
