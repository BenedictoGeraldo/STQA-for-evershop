const baseUrl = "http://localhost:3000/admin";
const loginEmail = "admin@email.com";
const loginPass = "123123123";

function adminLogin() {
  cy.visit(baseUrl + "/login");
  cy.get('input[name="email"]').type(loginEmail);
  cy.get('input[name="password"]').type(loginPass);
  cy.get('button[type="submit"]').click();
  cy.wait(1000);
  cy.url().should('include', "/admin");
}

describe("WCAG Usability Testing - Dashboard & Coupon Admin", () => {
  beforeEach(() => {
    adminLogin();
    // Tambah ini dari teman (untuk error handling lebih robust)
    cy.on('uncaught:exception', () => false);
  });

  it('TC-98 - Dashboard WCAG', () => {
    cy.wait(1000);
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],  // Tambah 2.1
      },
    });
    cy.log('✅ TC-98 Completed');
  });

  it('TC-99 - Coupon List WCAG', () => {
    cy.visit(baseUrl + '/coupons');
    cy.wait(1000);
    cy.injectAxe();
    // Scan hanya area table untuk performa lebih cepat
    cy.checkA11y('table', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
    cy.log('✅ TC-99 Completed');
  });

  it('TC-100 - New Coupon WCAG', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.wait(1000);
    cy.injectAxe();
    // Scan hanya form untuk lebih fokus
    cy.checkA11y('form', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
    cy.log('✅ TC-100 Completed');
  });

  it('TC-101 - Keyboard Navigation Form New Coupon', () => {
    cy.visit(baseUrl + '/coupon/new');
    cy.wait(1000);
    // Test fokus pada field penting
    cy.get('input[name="coupon"]')
      .should('not.have.attr', 'tabindex', '-1')
      .focus()
      .should('have.focus');

    cy.get('textarea[name="description"]')
      .focus()
      .should('have.focus');

    cy.log('✅ TC-101 Completed: Keyboard navigation OK');
  });
});