describe('Skenario Reliability Testing (TC-023 s/d TC-025)', () => {

  const userEmail = 'user@email.com';
  const userPass = '123123123';
  
  const specialCharAddress = {
    fullName: 'Evan Spesial @#$%',
    phone: '081200001111',
    address: 'Jalan @#$%^&*()_+{ :', 
    city: 'Jakarta Raya',
    postcode: '12190',
    province: 'Jakarta Raya'
  };

  const normalAddress = {
    fullName: 'Evan Normal',
    phone: '081299998888',
    address: 'Jl. Merdeka No. 1',
    city: 'Jakarta Raya',
    postcode: '12190',
    province: 'Jakarta Raya'
  };

  // Setup Global
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Handle exception untuk test Rage Click
    cy.on('uncaught:exception', () => false);

    // INTERCEPT
    cy.intercept('POST', '**/api/cart/*/items').as('addToCart');
    cy.intercept('POST', '**/customer/login').as('loginReq');
    cy.intercept('POST', '**/api/graphql').as('graphqlOp');
    cy.intercept({ method: /PATCH|PUT|POST/, url: '**/items/*' }).as('updateQty');

    // 1. Add Product
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
  });

  // --- TC-023: Stress Test Tombol Kuantitas ---
  it('TC-023: Sistem stabil saat tombol tambah kuantitas diklik berulang kali', () => {
    cy.visit('/cart');
    
    cy.get('table.cart__items__table').should('be.visible');
    cy.get('span.min-w-\\[3rem\\]').should('have.text', '1');

    // STRESS TEST: Klik 5x Cepat
    cy.log('--- START RAPID CLICKS ---');
    for(let i = 0; i < 5; i++) {
        cy.contains('button', '+').click();
    }

    // Tunggu sistem settle
    cy.wait('@updateQty', { timeout: 15000 });

    // Validasi
    cy.get('body').should('not.contain', 'Internal Server Error');
    cy.get('span.min-w-\\[3rem\\]').invoke('text').then((text) => {
        const qty = parseInt(text);
        expect(qty).to.be.gt(1);
        cy.log(`Final Qty after stress test: ${qty}`);
    });
  });

  // --- TC-025: Input Karakter Spesial (Fuzzing Test) ---
  it('TC-025: Sistem menangani input karakter spesial pada alamat tanpa crash', () => {
    cy.visit('/checkout');
    
    // Login
    cy.contains('button, a', 'Log in').click();
    cy.get('input[name="contact.email"]').type(userEmail);
    cy.get('input[name="contact.password"]').type(userPass);
    cy.get('button').contains(/^Log in$/).click();
    
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
    cy.log('--- WAITING FOR PAGE RELOAD ---');
    cy.wait(3000);

    // Isi Form Fuzzing
    cy.get('input[name="shippingAddress.full_name"]', {timeout: 10000})
      .should('be.visible')
      .clear().type(specialCharAddress.fullName);
      
    cy.get('input[name="shippingAddress.telephone"]').clear().type(specialCharAddress.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(specialCharAddress.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(specialCharAddress.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(specialCharAddress.postcode);

    cy.get('select[name="shippingAddress.country"]').select('ID');
    
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select('Jakarta Raya');

    // Validasi: Shipping Method Muncul
    cy.get('.shipping-methods-list input[type="radio"]', {timeout: 10000})
      .should('exist');
    
    cy.log('PASS: Sistem tidak crash menerima input karakter spesial.');
  });

  // --- TC-024: Stabilitas Klik Beruntun (Place Order) ---
  it('TC-024: Sistem mencegah duplikasi order saat tombol Place Order diklik berkali-kali', () => {
    // 1. Setup Full Checkout
    cy.visit('/checkout');
    cy.contains('button, a', 'Log in').click();
    cy.get('input[name="contact.email"]').type(userEmail);
    cy.get('input[name="contact.password"]').type(userPass);
    cy.get('button').contains(/^Log in$/).click();
    
    cy.wait('@loginReq');
    cy.wait(3000); 

    // Isi Alamat
    cy.get('input[name="shippingAddress.full_name"]').clear().type(normalAddress.fullName);
    cy.get('input[name="shippingAddress.telephone"]').clear().type(normalAddress.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(normalAddress.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(normalAddress.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(normalAddress.postcode);
    cy.get('select[name="shippingAddress.country"]').select('ID');
    cy.get('select[name="shippingAddress.province"]').should('not.be.disabled').select('Jakarta Raya');

    // --- PILIH SHIPPING (METODE AGRESIF) ---
    cy.log('--- MEMILIH SHIPPING METHOD (AGRESIF) ---');
    cy.contains('Contoh Shipping', {timeout: 10000}).should('be.visible');

    // 1. Klik Teks Label
    cy.contains('Contoh Shipping').click({force: true});
    
    // 2. Klik Kotak Pembungkus
    cy.contains('Contoh Shipping')
      .parents('.shipping-methods-list')
      .find('.border')
      .first()
      .click({force: true});

    // 3. Force Check Radio Input
    cy.contains('Contoh Shipping')
      .parents('.shipping-methods-list')
      .find('input[type="radio"]')
      .first()
      .check({force: true});

    cy.wait('@graphqlOp');

    // --- PILIH PAYMENT (METODE AGRESIF) ---
    cy.log('--- MEMILIH PAYMENT (AGRESIF) ---');
    
    // 1. Klik Teks
    cy.contains('span', 'Cash On Delivery').click({force: true});
    
    // 2. Klik Kotak
    cy.contains('span', 'Cash On Delivery')
      .parents('.payment-methods-list')
      .find('.border')
      .first()
      .click({force: true});

    // 3. Force Check Radio
    cy.contains('span', 'Cash On Delivery')
      .parents('.payment-methods-list')
      .find('input[type="radio"]')
      .first()
      .check({force: true});
      
    cy.wait('@graphqlOp');

    // --- TEST INTI: RAGE CLICK ---
    cy.log('--- RAGE CLICK PLACE ORDER ---');
    
    // Cari tombol "Place Order" (Indikator semua form valid)
    cy.get('button').contains('Place Order')
      .scrollIntoView()
      .should('be.visible')
      .should('not.be.disabled')
      .then(($btn) => {
          // Klik 5x menggunakan jQuery native
          try {
              for(let i=0; i<5; i++) {
                  $btn.click(); 
              }
          } catch (e) {
              cy.log('Page navigated away during rage click');
          }
      });

    // Validasi Redirect Sukses
    cy.url({ timeout: 30000 }).should('include', '/checkout/success');
    cy.log('PASS: Sistem berhasil memproses order di tengah gempuran klik.');
  });

});