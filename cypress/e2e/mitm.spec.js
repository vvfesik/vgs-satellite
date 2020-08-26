import { cutLine } from '../support/utils';

describe('Localhoste mitmproxy flow', function() {
  beforeEach(() => cy.fixCypressSpec(__filename));

  it('Visits Localhoste and gets 2 yamls from mitm request', function() {
    cy.visit('/');

    cy.server();
    cy.route('GET', 'mitms', 'fixture:mitm').as('getMitm');
    cy.wait(5000);
    cy.wait('@getMitm');

    cy.contains('/payment');

    cy.get('[data-role=logs-row]').click();
    cy.contains('http://app:8080/payment');
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
    cy.contains(
      'name=Bob+Jones&billing_address=1+Dr+Carlton+B+Goodlett+Pl%2C+San+Francisco%2C+CA+94102&card-number=5105105105105100&card-expiration-date=12%2F20&card-security-code=123&url=verygoodsecurity.com',
    );

    cy.get('.ant-btn-primary').click();
    cy.get('[data-role="quick-integration-modal"]').toMatchSnapshot();
    cy.contains('name: Bob+Jones').click({ force: true });
    cy.contains('card-number').click({ force: true });
    cy.get('[data-role="quick-integration-modal"]').toMatchSnapshot();

    cy.get('[data-role="select-secure-payload"]').click();

    cy.fixture('mitm-inbound.yaml').then(yaml => {
      cy.get('[data-role="inbound-code-container"] pre code').should($div => {
        expect(cutLine($div.get(0).innerText)).to.eq(cutLine(yaml));
      });
    });
    cy.contains('Export Inbound YAML').click();

    cy.get('.nav-link')
      .contains('Outbound')
      .click();

    cy.fixture('mitm-outbound.yaml').then(yaml => {
      cy.get('[data-role="outbound-code-container"] pre code').should($div => {
        expect(cutLine($div.get(0).innerText)).to.eq(cutLine(yaml));
      });
    });
    cy.contains('Export Outbound YAML').click();
  });
});
