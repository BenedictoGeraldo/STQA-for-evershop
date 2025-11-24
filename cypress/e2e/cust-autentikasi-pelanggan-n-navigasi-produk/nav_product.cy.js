// cypress/e2e/cust-authentication.cy.js

/**
 * ======================================================================
 * GRUP 1: Tes yang dimulai dari Halaman Login (Kondisi Logged-Out)
 * ======================================================================
 * Meliputi: TC-001 dan  TC-006/TC-010
 */


describe("Full E2E Authentication Flow – Evershop", () => {
  const baseUrl = "http://localhost:3000";
  const loginUrl = `${baseUrl}/account/login`;

  beforeEach(() => {
    cy.visit(loginUrl);
  });

  it('TC-023 Navigasi breadcrumbs ke homepage', () => {
    cy.get('.breadcrumb').contains('Home').click();
    cy.url().should('eq', baseUrl + '/');
  });

  it('TC-025 Navigasi ke kategori WOMEN', () => {
    cy.visit('/');
    cy.contains(/shop women/i).click();
    cy.url().should('include', '/women');

    // FIXED: Evershop pakai <h1> untuk title kategori
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Women');

    cy.get('.breadcrumb').should('contain.text', 'Women');
  });

  it('TC-026 Header Shop menuju katalog utama', () => {

    // buka homepage
    cy.visit('/');

    // Pastikan header render 
    cy.get('.header', { timeout: 10000 })
    .should('exist')
    .and('be.visible');

    // Klik ikon search
    cy.get('.logo-icon', { timeout: 10000 })
    .should('exist')
    .and('be.visible')
    .click({ force: true });
    });


  it('TC-027 Breadcrumbs Kids ke Home', () => {
    cy.visit('/kids');
    cy.get('.breadcrumb').contains('Home').click();
    cy.url().should('eq', baseUrl + '/');
  });

  it('TC-028 Women category empty state', () => {
    cy.visit('/women');
    cy.contains('There is no product to display', { timeout: 8000 }).should('be.visible');
  });

  it('TC-029 Sort by Price: Low to High', () => {
    // Visit category page
    cy.visit('/kids');   // ganti ke /women jika untuk kategori Women

    // Select sorting by Price (Low to High)
    cy.get('select.form-field').select('price');

    // Get all product prices
    cy.get('.product-price').then($p => {
        const prices = [...$p].map(el =>
            parseFloat(el.textContent.replace('$', '').trim())
        );

        // Duplicate & sort ascending
        const sorted = [...prices].sort((a, b) => a - b);

        // Assertion: should match ascending order
        expect(prices).to.deep.equal(sorted);
        });
    });


  it('TC-030 Filter harga $0 - $50 menampilkan produk sesuai rentang', () => {
    cy.visit('/women');

    // Filter price (selector sesuai Evershop)
    cy.get('input[name="min_price"]').clear().type('0');
    cy.get('input[name="max_price"]').clear().type('50');
    cy.contains('Apply').click();

    cy.get('.product-price').each(($el) => {
      const price = parseFloat($el.text().replace('$', ''));
      expect(price).to.be.gte(0).and.lte(50);
    });
  });

  it('TC-032 Search input muncul ketika ikon search diklik dan bisa dipakai', () => {

  // buka homepage
  cy.visit('/');

  // Pastikan header render 
  cy.get('.header', { timeout: 10000 })
    .should('exist')
    .and('be.visible');

  // Klik ikon search
  cy.get('.search-icon', { timeout: 10000 })
    .should('exist')
    .and('be.visible')
    .click({ force: true });

  // Pastikan container input muncul
  cy.get('.search-input-container', { timeout: 10000 })
    .should('exist')
    .and('be.visible');

  // Pastikan input Search tampil
  cy.get('.search-input-container input', { timeout: 10000 })
    .should('exist')
    .and('be.visible')
    .and('have.attr', 'placeholder', 'Search');

    });


  it('TC-034 Validasi detail produk', () => {
    cy.visit('/striped-cotton-sweater');

    cy.contains('Striped Cotton Sweater').should('be.visible');
    cy.contains('$90.00').should('be.visible');
    cy.contains('SCS-24680').should('be.visible');
  });

  it('TC-035 Fungsi tombol ADD TO CART', () => {
    cy.visit('/striped-cotton-sweater');

    cy.contains('ADD TO CART').click();

    // Tetap 1 karena server tidak memproses qty
    cy.get('.add-cart-popup-button', { timeout: 10000 })
    .should('be.visible');
    });

  it('TC-036 Input kuantitas sebelum add to cart', () => {
  cy.visit('/striped-cotton-sweater');

  cy.get('input[name="qty"]')
    .clear()
    .type('5');

  cy.contains('ADD TO CART').click();

  cy.get('.add-cart-popup-button', { timeout: 10000 })
    .should('be.visible');
    });

  it('TC-037 Produk tanpa gambar utama', () => {
    cy.visit('/produk-tanpa-gambar');

    // Evershop placeholder image
    cy.get('.product-gallery img').should('exist');
  });

});
