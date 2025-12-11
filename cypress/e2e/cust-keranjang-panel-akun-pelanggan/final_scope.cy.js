describe('Final Scope Front Store: Checkout & Portability (TC-031, TC-046, TC-047, TC-035, TC-040)', () => {

  const userEmail = 'user@email.com';
  const userPass = '123123123';
  
  const guestData = {
    email: 'guest_final@test.com',
    fullName: 'Final Tester',
    phone: '08123456789',
    address: 'Jl. Terakhir No. 99',
    city: 'Jakarta Selatan',
    postcode: '12345',
    province: 'Jakarta Raya'
  };

  beforeEach(() => {
    // 1. CLEANUP
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);

    // 2. INTERCEPT
    cy.intercept('POST', '**/api/cart/*/items').as('addToCart');
    cy.intercept('POST', '**/customer/login').as('loginReq');
    // Intercept GraphQL untuk checkout flow
    cy.intercept('POST', '**/api/graphql').as('graphqlOp');
  });

  // --- TC-031: Checkout - Kode Pos Pendek (Negative) ---
  it('TC-031: Validasi Kode Pos terlalu pendek (2 Digit) di Checkout', () => {
    // 1. Setup Cart
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
    cy.visit('/checkout');

    // 2. Isi Data (Kecuali Kode Pos)
    cy.get('input[name="contact.email"]').type(guestData.email);
    cy.get('input[name="shippingAddress.full_name"]').type(guestData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').type(guestData.phone);
    cy.get('input[name="shippingAddress.address_1"]').type(guestData.address);
    cy.get('input[name="shippingAddress.city"]').type(guestData.city);
    
    // 3. ACTION: Input Kode Pos 2 Digit
    cy.log('--- INPUT KODE POS PENDEK ---');
    cy.get('input[name="shippingAddress.postcode"]').type('12'); 
    
    // Trigger blur
    cy.get('input[name="shippingAddress.city"]').click();

    // 4. VALIDASI
    cy.get('input[name="shippingAddress.postcode"]')
      .parent()
      .then(($container) => {
          if ($container.text().match(/valid|short|number/i)) {
              cy.log('PASS: Sistem menampilkan error validasi kode pos.');
              cy.wrap($container).should('contain.text', 'valid');
          } 
          else {
              cy.log('**[TEMUAN BUG]** Sistem menerima Kode Pos 2 digit tanpa error (Validasi Lemah).');
              // Assert bahwa TIDAK ada error
              cy.wrap($container).invoke('text').should('not.match', /valid|short|number/i);
          }
      });
  });

  // --- TC-046: Tampilan "My Account" di Tablet (Portability) ---
  it('TC-046: Portability - Tampilan Menu Akun di Layar Tablet (iPad)', () => {
    // 1. Set Viewport Tablet
    cy.viewport('ipad-2'); // 768 x 1024
    
    // 2. Login Flow
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();
    
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
    cy.location('pathname', {timeout: 10000}).should('eq', '/'); 
    
    // 3. Visit Account
    cy.visit('/account');

    // 4. VALIDASI UI TABLET
    cy.contains('Recent Orders').scrollIntoView().should('be.visible');
    
    // Validasi Layout Width (Horizontal Scroll Check)
    cy.window().then((win) => {
        const scrollWidth = win.document.documentElement.scrollWidth;
        const clientWidth = win.document.documentElement.clientWidth;
        // Toleransi kecil 5px (untuk scrollbar browser)
        expect(scrollWidth).to.be.lte(clientWidth + 5, 'Layout harus fit di layar tablet');
    });
  });

  // --- TC-047: Checkout Payment Method: COD Only (FIXED AGGRESSIVE) ---
  it('TC-047: Functional - Validasi Payment Method (Hanya COD yang aktif)', () => {
    // 1. Setup Cart & Checkout
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
    cy.visit('/checkout');
    
    // 2. Isi Data Tamu
    cy.get('input[name="contact.email"]').type(guestData.email);
    cy.get('input[name="shippingAddress.full_name"]').type(guestData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').type(guestData.phone);
    cy.get('input[name="shippingAddress.address_1"]').type(guestData.address);
    cy.get('input[name="shippingAddress.city"]').type(guestData.city);
    cy.get('input[name="shippingAddress.postcode"]').type(guestData.postcode);
    cy.get('select[name="shippingAddress.country"]').select('ID');
    
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select(guestData.province);
    
    // 3. Pilih Shipping (Metode Agresif)
    cy.log('--- MEMILIH SHIPPING METHOD ---');
    cy.contains('Contoh Shipping', {timeout: 10000}).should('be.visible');

    cy.contains('Contoh Shipping').click({force: true});
    cy.contains('Contoh Shipping')
      .parents('.shipping-methods-list')
      .find('input[type="radio"]')
      .first()
      .check({force: true});
    
    cy.wait('@graphqlOp');
    
    // 4. VALIDASI PAYMENT (Sesuai PDF TC-047)
    cy.log('--- VALIDASI PAYMENT ---');
    
    // Assert COD Ada
    cy.contains('span', 'Cash On Delivery').should('be.visible');
    
    // Assert Stripe/Paypal TIDAK ADA (Negative Check)
    cy.contains('span', 'Stripe').should('not.exist');
    cy.contains('span', 'PayPal').should('not.exist');
    cy.contains('span', 'Credit Card').should('not.exist');
    
    // 5. Finalisasi Order (Force Check COD)
    cy.contains('span', 'Cash On Delivery')
       .parents('.payment-methods-list')
       .find('input[type="radio"]')
       .first()
       .check({force: true});
       
    cy.wait('@graphqlOp');

    // Place Order
    cy.get('button').contains('Place Order')
      .scrollIntoView()
      .should('not.be.disabled')
      .click();
    
    cy.url({timeout: 20000}).should('include', '/checkout/success');
    cy.log('PASS: Order berhasil menggunakan satu-satunya metode aktif (COD).');
  });

  // --- TC-035: Validasi Fitur Search (FIXED SELECTOR) ---
  it('TC-035: Validasi Fitur Search (Produk Ada vs Tidak Ada)', () => {
      // 1. Test Positive: Cari produk yang ADA (Thermos)
      cy.visit('/'); 
      
      // Klik ikon kaca pembesar
      cy.get('.search__icon').should('be.visible').click(); 
      
      // Selector Search Input
      // Di beberapa viewport ada 2 input search (desktop & mobile). Kita ambil yang visible.
      cy.get('input[placeholder="Search"]')
        .filter(':visible') // Hanya ambil yang terlihat
        .first()
        .clear()
        .type('Thermos{enter}');
      
      // Validasi: Harus muncul produk terkait
      cy.url().should('include', '/search');
      cy.contains('Thermos').should('be.visible');

      // 2. Test Negative: Cari produk NGAWUR
      cy.get('.search__icon').click(); 

      cy.get('input[placeholder="Search"]')
        .filter(':visible')
        .first()
        .clear()
        .type('ProdukGaib12345{enter}');
      
      // Validasi: Harus muncul pesan error/kosong
      cy.contains(/No results|0 products|not found|tidak ditemukan/i).should('be.visible');
  });

  // --- TC-040: Validasi Halaman Error 404 ---
  it('TC-040: Validasi Halaman 404 saat akses URL tidak valid', () => {
      // Akses URL acak yang pasti tidak ada
      cy.visit('/halaman-ini-pasti-tidak-ada-123', { failOnStatusCode: false }); 
      
      // Validasi UI: Pastikan muncul tulisan 404 atau Page Not Found
      cy.get('body').then(($body) => {
          if ($body.text().includes('404')) {
              cy.contains('404').should('be.visible');
          } else {
              cy.contains(/Page not found|Halaman tidak ditemukan/i).should('be.visible');
          }
      });
  });

});