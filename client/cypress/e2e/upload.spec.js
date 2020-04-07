describe('Localhoste upload single flow', function() {
  it('Visits Localhoste and gets 2 yamls from uploaded har file', function() {
    cy.visit('/');
    cy.contains('Upload HAR file(s)');

    cy.get('[data-role="import-from-yaml"]').attachFile('upload.har');

    cy.contains('/post');
    cy.get('[data-role=logs-row]').click();
    cy.contains('http://httpbin.org/post');
    cy.get('[data-role="select-response-phase"]').click();
    cy.get('[data-role="select-request-phase"]').click();

    cy.get('[data-role="tab-headers"]').click();
    cy.get('[data-role="select-response-phase"]').click();
    cy.get('[data-role="select-request-phase"]').click();

    cy.get('[data-role="tab-body"]').click();
    cy.get('[data-role="select-response-phase"]').click();
    cy.get('[data-role="select-request-phase"]').click();
    cy.contains('{"foo": "bar"}');

    cy.get('.ant-btn-primary').click();
    cy.contains('foo: bar').click();

    cy.get('[data-role="select-secure-payload"]').click();

    cy.fixture('upload-inbound.yaml').then(yaml => {
      cy.get('[data-role="inbound-code-container"] pre code').should($div => {
        const lines = yaml.split('\n');
        lines
          .filter(line => !line.includes('name: '))
          .forEach(line => {
            expect($div.get(0).innerText).to.contain(line);
          });
      });
    });
    cy.contains('Export Inbound YAML').click();

    cy.get('.nav-link')
      .contains('Outbound')
      .click();

    cy.fixture('upload-outbound.yaml').then(yaml => {
      cy.get('[data-role="outbound-code-container"] pre code').should($div => {
        const lines = yaml.split('\n');
        lines
          .filter(line => !line.includes('name: '))
          .forEach(line => {
            expect($div.get(0).innerText).to.contain(line);
          });
      });
    });
    cy.contains('Export Outbound YAML').click();
  });
});
