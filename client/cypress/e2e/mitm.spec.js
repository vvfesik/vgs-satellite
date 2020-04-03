
describe('Localhoste mitmproxy flow', function() {
  it('Visits Localhoste and gets 2 yamls from mitm request', function() {
    cy.visit('/')
    cy.contains('Upload HAR file(s)')

    cy.server()
    cy.route('GET', 'mitms', 'fixture:mitm').as('getMitm')
    cy.wait('@getMitm')

    cy.contains('payment')
    cy.get('[data-role=logs-row]').click()
    cy.contains('http://app:8080/payment')
    cy.get('[data-role="select-response-phase"]').click()
    cy.get('[data-role="select-request-phase"]').click()

    cy.get('[data-role="tab-headers"]').click()
    cy.get('[data-role="select-response-phase"]').click()
    cy.get('[data-role="select-request-phase"]').click()

    cy.get('[data-role="tab-body"]').click()
    cy.get('[data-role="select-response-phase"]').click()
    cy.get('[data-role="select-request-phase"]').click()
    cy.contains('name=Bob+Jones&billing_address=1+Dr+Carlton+B+Goodlett+Pl%2C+San+Francisco%2C+CA+94102&card-number=5105105105105100&card-expiration-date=12%2F20&card-security-code=123&url=verygoodsecurity.com')
    
    cy.get('.ant-btn-primary').click()
    cy.contains('name: Bob+Jones').click()
    cy.contains('card-number').click()

    cy.get('[data-role="select-secure-payload"]').click()
    cy.contains('Export Inbound YAML').click()

    cy.get('.nav-link').contains('Outbound').click()
    cy.contains('Export Outbound YAML').click()
  })
})
