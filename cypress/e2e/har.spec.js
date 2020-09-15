import { cutLine } from '../support/utils';

describe('Localhoste upload single har flow', function() {
  beforeEach(() => cy.fixCypressSpec(__filename));

  it('Visits Localhoste and gets 2 yamls from uploaded har file', function() {
    cy.visit('/');
    cy.get('[data-role="import-from-har"]').attachFile('upload-post.har');

    cy.contains('/post');

    cy.get('[data-role="logs-row"]').click();
    cy.contains('http://httpbin.org/post');
    cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

    cy.get('[data-role="select-response-phase"]').click();
    cy.get('[data-role="select-request-phase"]').click();

    cy.get('[data-role="tab-headers"]').click();
    cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

    cy.get('[data-role="select-response-phase"]').click();
    cy.get('[data-role="log-details-modal"]').toMatchSnapshot();
    cy.get('[data-role="select-request-phase"]').click();

    cy.get('[data-role="tab-body"]').click();
    cy.get('[data-role="log-details-modal"]').toMatchSnapshot();

    cy.get('[data-role="select-response-phase"]').click();
    cy.get('[data-role="log-details-modal"]').toMatchSnapshot();
    cy.get('[data-role="select-request-phase"]').click();
    cy.contains('{"foo": "bar"}');

    cy.get('.ant-btn-primary').click();
    cy.get('[data-role="quick-integration-modal"]').toMatchSnapshot();
    cy.contains('foo: bar').click({ force: true });
    cy.get('[data-role="quick-integration-modal"]').toMatchSnapshot();

    cy.get('[data-role="select-secure-payload"]').click();
    cy.get('[data-role="whats-next-stepper"]').toMatchSnapshot();

    cy.fixture('upload-inbound.yaml').then(yaml => {
      cy.get('[data-role="inbound-code-container"] pre code').should($div => {
        expect(cutLine($div.get(0).innerText)).to.eq(cutLine(yaml));
      });
    });
    cy.contains('Export Inbound YAML').click();

    cy.get('.nav-link')
      .contains('Outbound')
      .click();

    cy.fixture('upload-outbound.yaml').then(yaml => {
      cy.get('[data-role="outbound-code-container"] pre code').should($div => {
        expect(cutLine($div.get(0).innerText)).to.eq(cutLine(yaml));
      });
    });
    cy.contains('Export Outbound YAML').click().type('{esc}');
  });
});
