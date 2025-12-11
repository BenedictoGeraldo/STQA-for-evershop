describe('Skenario Validasi & Reliability Checkout (Single Page Flow)', () => {

  const invalidEmail = 'budi.com'; 
  const invalidPhone = 'NomorHP'; 
  const longAddress = 'Jalan Panjang Sekali '.repeat(20); 
  
  const validData = {
    email: 'guest_valid@test.com',
    fullName: 'Guest Validation',
    phone: '08123456789',
    address: 'Jl. Valid No. 1',
    city: 'Jakarta Selatan',
    postcode: '12345',
    province: 'Jakarta Raya' 
  };

  // SETUP GLOBAL
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);

    // INTERCEPT
    cy.intercept('POST', '**/api/cart/*/items').as('addToCart');
    
    // 1. Add Product
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
    
    // 2. Visit Checkout
    cy.visit('/checkout');
    // Pastikan halaman checkout load
    cy.get('h1').contains(/Checkout|Contact/i).should('be.visible');
  });

  // --- TC-029: Negative Test Email (PASS) ---
  it('TC-029: Validasi Format Email Tidak Valid (Tanpa @)', () => {
    cy.get('input[name="contact.email"]').type(invalidEmail);
    cy.get('input[name="shippingAddress.full_name"]').click(); // Trigger blur

    // Validasi Error Message
    cy.get('input[name="contact.email"]')
      .parent()
      .should('contain.text', 'valid'); 
      
    // Validasi Tombol Disabled
    cy.get('button[type="submit"]')
      .should('be.disabled');
  });

  // --- TC-034: Negative Test Provinsi Wajib (FIXED BUTTON TEXT) ---
  it('TC-034: Validasi Provinsi Wajib Dipilih (Shipping Method tidak muncul)', () => {
    cy.get('input[name="contact.email"]').type(validData.email);

    // Isi semua KECUALI Provinsi
    cy.get('input[name="shippingAddress.full_name"]').type(validData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').type(validData.phone);
    cy.get('input[name="shippingAddress.address_1"]').type(validData.address);
    cy.get('input[name="shippingAddress.city"]').type(validData.city);
    cy.get('input[name="shippingAddress.postcode"]').type(validData.postcode);
    cy.get('select[name="shippingAddress.country"]').select('ID');
    
    cy.wait(2000); 

    // VALIDASI: Shipping Method TIDAK MUNCUL
    cy.get('body').then(($body) => {
        if ($body.find('.shipping-methods-list').length > 0) {
            cy.get('.shipping-methods-list').find('input[type="radio"]').should('not.exist');
        } else {
            cy.get('.shipping-methods-list').should('not.exist');
        }
    });
      
    // [FIXED] Jangan cari teks 'Place Order', tapi cari tombol submit generic
    // Karena teksnya berubah jadi "Select a payment method"
    cy.get('button[type="submit"]')
       .scrollIntoView()
       .should('be.visible')
       .should('be.disabled') // Pastikan mati
       .and('not.contain', 'Place Order'); // Pastikan teksnya BUKAN Place Order (artinya belum siap)
       
    cy.log('PASS: Tombol Checkout disabled karena provinsi belum dipilih');
  });

  // --- TC-030: Validasi No HP Huruf (BUG CONFIRMATION) ---
  it('TC-030: Verifikasi Input No HP Huruf (Temuan Bug: Validasi Lemah)', () => {
    cy.get('input[name="contact.email"]').type(validData.email);
    
    // ACTION: Input Huruf di No HP
    cy.get('input[name="shippingAddress.telephone"]').type(invalidPhone);
    cy.get('input[name="shippingAddress.full_name"]').click(); 

    // VALIDASI BUG: Assert TIDAK ADA pesan error
    cy.get('input[name="shippingAddress.telephone"]')
      .parent()
      .invoke('text')
      .should('not.match', /valid|number|required/i); 

    cy.log('**[TEMUAN BUG]** Sistem menerima input huruf pada field Telepon tanpa pesan error!');
  });

  // --- TC-032: Alamat Panjang (PASS) ---
  it('TC-032: Validasi Input Alamat Sangat Panjang (Boundary)', () => {
    cy.get('input[name="contact.email"]').type(validData.email);
    
    cy.get('input[name="shippingAddress.full_name"]').type(validData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').type(validData.phone);
    
    cy.get('input[name="shippingAddress.address_1"]').type(longAddress, {delay: 0});
    
    cy.get('input[name="shippingAddress.city"]').type(validData.city);
    cy.get('input[name="shippingAddress.postcode"]').type(validData.postcode);
    cy.get('select[name="shippingAddress.country"]').select('ID');
    
    cy.wait(1000);
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select(validData.province);

    // VALIDASI: Shipping Method MUNCUL
    cy.contains('Contoh Shipping', {timeout: 15000}).should('be.visible');
    
    // Pastikan UI tidak pecah fatal (tombol bisa diklik)
    cy.contains('Contoh Shipping').click({force: true});
  });

  // --- TC-033: Refresh Page (BUG CONFIRMATION) ---
  it('TC-033: Refresh Halaman saat Guest Checkout (Temuan: Data Reset)', () => {
    // 1. Isi Data
    cy.get('input[name="contact.email"]').type(validData.email);
    cy.get('input[name="shippingAddress.full_name"]').type(validData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').type(validData.phone);
    cy.get('input[name="shippingAddress.address_1"]').type(validData.address);
    cy.get('input[name="shippingAddress.city"]').type(validData.city);
    cy.get('input[name="shippingAddress.postcode"]').type(validData.postcode);
    cy.get('select[name="shippingAddress.country"]').select('ID');
    
    cy.wait(1000);
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select(validData.province);
    
    cy.contains('Contoh Shipping', {timeout: 10000}).should('be.visible');

    // 2. REFRESH
    cy.log('--- MELAKUKAN REFRESH ---');
    cy.reload();
    
    cy.get('h1').contains(/Checkout|Contact/i).should('be.visible');

    // 3. VALIDASI BUG: Data Hilang
    cy.get('input[name="contact.email"]').should('have.value', '');
    
    cy.log('**[INFO/BUG]** Data Guest User hilang sepenuhnya setelah refresh page.');
  });

});