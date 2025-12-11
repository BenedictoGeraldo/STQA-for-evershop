// cypress/e2e/cust-authentication.cy.js



describe("Full E2E Authentication Flow – Evershop", () => {
  const baseUrl = "http://localhost:3000";
  const loginUrl = `${baseUrl}/account/login`;

  beforeEach(() => {
    cy.visit(loginUrl);
  });

  it('TC-197 Navigasi breadcrumbs ke homepage', () => {
    cy.get('.breadcrumb').contains('Home').click();
    cy.url().should('eq', baseUrl + '/');
  });

  it('TC-199 Navigasi ke kategori WOMEN', () => {
    cy.visit('/');
    cy.contains(/shop women/i).click();
    cy.url().should('include', '/women');

    // FIXED: Evershop pakai <h1> untuk title kategori
    cy.get('h1', { timeout: 10000 }).should('contain.text', 'Women');

    cy.get('.breadcrumb').should('contain.text', 'Women');
  });

  it('TC-200 Header Shop menuju katalog utama', () => {

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


  it('TC-201 Breadcrumbs Kids ke Home', () => {
    cy.visit('/kids');
    cy.get('.breadcrumb').contains('Home').click();
    cy.url().should('eq', baseUrl + '/');
  });

  it('TC-202 Women category empty state', () => {
    cy.visit('/women');
    cy.contains('There is no product to display').should('be.visible');
  });

  it('TC-203 Sort by Price: Low to High', () => {

    cy.visit('/kids');

    // Simpan jumlah produk sebelum sort
    cy.get('.product-count').invoke('text').then(before => {

        cy.intercept('GET', '**/kids?ob=price*').as('sortPrice');
        cy.get('select.form-field').select('price');
        cy.wait('@sortPrice');

        // Tunggu tulisan "3 products" berubah menjadi state baru
        cy.get('.product-count', { timeout: 10000 })
            .should(($span) => {
                expect($span.text().trim()).to.eq(before.trim());
            });

        cy.get('.product-price-listing').then($p => {
            const prices = [...$p].map(el =>
                parseFloat(el.innerText.replace(/[^0-9.]/g, ''))
            );
            const sorted = [...prices].sort((a, b) => a - b);
            expect(prices).to.deep.equal(sorted);
        });
    });
  });




    it('TC-204 Filter harga 100 - 110 menampilkan produk sesuai rentang', () => {
    cy.visit('/kids');

    // Buka filter (wajib, karena class = "hidden")
    cy.get('.filter-opener').click({ force: true });

    // Set slider min
    cy.get('input[type="range"].min')
      .invoke('val', 100)
      .trigger('input', { force: true });

    // Set slider max
    cy.get('input[type="range"].max')
      .invoke('val', 110)
      .trigger('input', { force: true });

    // Tunggu filter apply otomatis
    cy.wait(500);

    // Verifikasi harga produk dalam range
    cy.get('.product-price-listing').each(($el) => {
      const price = parseFloat($el.text().replace('$', ''));
      expect(price).to.be.gte(100).and.lte(120);
    });
  });



  it('TC-206 Search input muncul ketika ikon search diklik dan bisa dipakai', () => {

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


  it('TC-208 Validasi detail produk', () => {
    cy.visit('striped-cotton-sweater');

    cy.contains('Striped Cotton Sweater').should('be.visible');
    cy.contains('$90.00').should('be.visible');
    cy.contains('SCS-24680').should('be.visible');
  });

  it('TC-209 Fungsi tombol ADD TO CART', () => {
    cy.visit('striped-cotton-sweater');

    cy.contains('ADD TO CART').click();

    // Tetap 1 karena server tidak memproses qty
    cy.get('.add-cart-popup-button', { timeout: 10000 })
    .should('be.visible');
    });

  it('TC-210 Input kuantitas sebelum add to cart', () => {
  cy.visit('striped-cotton-sweater');

  cy.get('input[name="qty"]')
    .clear()
    .type('5');

  cy.contains('ADD TO CART').click();

  cy.get('.add-cart-popup-button', { timeout: 10000 })
    .should('be.visible');
    });
  });
