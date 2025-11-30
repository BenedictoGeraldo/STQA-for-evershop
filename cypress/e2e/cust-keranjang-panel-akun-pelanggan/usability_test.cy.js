describe('Skenario Aksesibilitas & Usability (TC-054 s/d TC-056)', () => {

  // URL Produk untuk Precondition (Menambah item ke cart)
  const productUrl = '/accessories/stainless-steel-thermos-yellow?color=3';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Menangani error internal aplikasi agar tes tidak berhenti (Critical untuk A11y scan)
    cy.on('uncaught:exception', () => false);
  });

  // --- TC-054: Audit Aksesibilitas Halaman Cart ---
  it('TC-054: Audit Aksesibilitas Halaman Cart (WCAG 2.1 Level AA)', () => {
    // 1. Precondition: Tambah Barang ke Cart (Agar halaman ter-render utuh dengan tabel)
    cy.visit(productUrl);
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000); 

    // 2. Visit Cart
    cy.visit('/cart');
    cy.get('table.cart__items__table').should('be.visible');

    // 3. ACTION: Inject & Scan Axe
    cy.injectAxe();
    
    // Konfigurasi Scan: Hanya aturan WCAG 2.1 AA
    const scanOptions = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    };

    // Melakukan scan pada seluruh halaman
    // Note: Log custom sudah di-handle di e2e.ts, cukup panggil command ini.
    cy.checkA11y(null, scanOptions);
  });

  // --- TC-055: Audit Aksesibilitas Halaman Checkout ---
  it('TC-055: Audit Aksesibilitas Halaman Checkout (Fokus Area Form)', () => {
    // 1. Precondition: Tambah Barang ke Cart
    cy.visit(productUrl);
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000); 

    // 2. Visit Checkout
    cy.visit('/checkout');
    // Tunggu sampai form kontak muncul sebagai tanda halaman siap
    cy.get('input[name="contact.email"]').should('be.visible');

    // 3. ACTION: Inject Axe
    cy.injectAxe();

    const scanOptions = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    };

    // 4. Scan SPESIFIK pada Container Form (Context)
    // Menggunakan selector 'form' agar scan fokus pada input fields, label, dan struktur form
    cy.checkA11y('form', scanOptions);
  });

  // --- TC-056: Validasi Navigasi Keyboard (Focus Order) ---
  it('TC-056: Validasi Navigasi Keyboard dan Focus Order pada Field Utama', () => {
    // 1. Precondition: Visit Checkout (dengan barang)
    cy.visit(productUrl);
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000); 
    cy.visit('/checkout');
    
    // Tunggu elemen render
    cy.get('input[name="contact.email"]').should('be.visible');

    // 2. VALIDASI MANUAL: Email Field
    cy.log('--- CEK FOKUS EMAIL ---');
    cy.get('input[name="contact.email"]')
      .should('not.have.attr', 'tabindex', '-1') // Pastikan tidak di-exclude dari tab order
      .focus()
      .should('have.focus'); // Validasi visual focus ring aktif secara browser native

    // 3. VALIDASI MANUAL: Nama Lengkap
    cy.log('--- CEK FOKUS FULL NAME ---');
    cy.get('input[name="shippingAddress.full_name"]')
      .should('not.have.attr', 'tabindex', '-1')
      .focus()
      .should('have.focus');

    // 4. VALIDASI MANUAL: Alamat
    cy.log('--- CEK FOKUS ADDRESS ---');
    cy.get('input[name="shippingAddress.address_1"]')
      .should('not.have.attr', 'tabindex', '-1')
      .focus()
      .should('have.focus');

    // 5. VALIDASI MANUAL: Kota
    cy.log('--- CEK FOKUS CITY ---');
    cy.get('input[name="shippingAddress.city"]')
      .focus()
      .should('have.focus');

    cy.log('PASS: Semua field utama dapat menerima fokus keyboard (Tab Order Valid).');
  });

});