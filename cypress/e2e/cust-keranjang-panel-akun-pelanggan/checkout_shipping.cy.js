describe('E2E Full Checkout Flow (TC-008, 009, 010)', () => {
  
  // Gunakan akun dummy yang valid di local Anda
  const userEmail = 'user@email.com';
  const userPass = '123123123';
  
  const shippingData = {
    fullName: 'Evan Test',
    phone: '081234567890',
    address: 'Jl. Jenderal Sudirman No. 1',
    city: 'Jakarta Pusat',
    postcode: '12190',
    province: 'Jakarta Raya' // Sesuai data "Jakarta Raya"
  };

  it('TC-008/009/010: Full Flow - Login, Isi Alamat, & Validasi Sukses', () => {
    
    // --- SETUP LISTENER API (PENTING) ---
    // Kita pasang "telinga" dulu sebelum mulai
    cy.intercept('POST', '**/login').as('loginRequest'); // Asumsi endpoint login
    cy.intercept('POST', '**/shippingMethods').as('addShipping');
    cy.intercept('POST', '**/paymentMethods').as('addPayment');
    cy.intercept('POST', '**/graphql').as('placeOrder'); // Untuk final order

    // --- STEP 1: Add to Cart & Go to Checkout ---
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.on('uncaught:exception', () => false);

    cy.contains('button', 'ADD TO CART').should('be.visible').click();
    // Tunggu sebentar untuk animasi
    cy.wait(1000); 
    
    cy.visit('/checkout');
    cy.url().should('include', '/checkout');

    // --- STEP 2 (TC-008): LOGIN DI HALAMAN CHECKOUT ---
    cy.log('--- PROSES LOGIN ---');
    // Klik link/tombol "Log in" di checkout
    cy.contains('button, a', 'Log in').click();
    
    // Isi Form Login
    // Selector name="..." aman dengan titik, tidak perlu escape (\\)
    cy.get('input[name="contact.email"]').should('be.visible').clear().type(userEmail);
    cy.get('input[name="contact.password"]').should('be.visible').clear().type(userPass);
    
    // Klik Login
    cy.get('button').contains(/^Log in$/).click();

    // Tunggu API Login selesai & Loading hilang
    // Jika tidak di-intercept, kadang form alamat tidak mau terisi
    // Note: Jika endpoint login bukan /login, sesuaikan atau gunakan wait UI
    cy.wait(2000); 
    
    // Validasi Login Sukses: Form nama/email biasanya terisi atau link "Log in" hilang
    cy.contains('Already have an account?').should('not.exist');

    // --- STEP 3 (TC-009): ISI ALAMAT ---
    cy.log('--- MENGISI ALAMAT PENGIRIMAN ---');
    // Kita gunakan selector name="..." agar konsisten dengan kode awal Anda
    cy.get('input[name="shippingAddress.full_name"]').clear().type(shippingData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').clear().type(shippingData.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(shippingData.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(shippingData.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(shippingData.postcode);

    // Pilih Negara & Provinsi
    cy.get('select[name="shippingAddress.country"]').select('ID'); 
    cy.wait(1000); // Tunggu load provinsi
    
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select(shippingData.province); 

    // --- STEP 4: PILIH SHIPPING METHOD (FIXED RACE CONDITION) ---
    cy.log('--- MEMILIH SHIPPING METHOD ---');
    // Tunggu opsi muncul
    cy.wait(3000); 

    // HAPUS IF-ELSE. Kita Paksa Klik.
    // Gunakan .closest() agar klik di area yang aman
    cy.contains('Contoh Shipping')
      .closest('div')
      .click();

    // WAJIB: Tunggu server menyimpan pilihan
    cy.wait('@addShipping').its('response.statusCode').should('eq', 200);

    // --- STEP 5: PILIH PAYMENT (FIXED) ---
    cy.log('--- MEMILIH PAYMENT METHOD ---');
    cy.wait(1000);
    
    cy.contains('span', 'Cash On Delivery')
       .closest('div')
       .click();
       
    // Tunggu server menyimpan payment (jika ada request) atau wait UI
    cy.wait(2000); 

    // Billing Address: Same as shipping
    cy.get('#same-address').check({force: true});

    // --- STEP 6 (TC-010): PLACE ORDER & VALIDASI ---
    cy.log('--- KLIK PLACE ORDER ---');
    
    // Pastikan tombol aktif
    cy.get('button').contains('Place Order')
      .should('not.be.disabled')
      .click();

    // Validasi Sukses
    // URL Success
    cy.url({timeout: 30000}).should('include', '/checkout/success');
    
    // Validasi Konten
    cy.get('body').should('contain', 'Thank you');
    cy.get('body').should('contain', shippingData.fullName);
    cy.get('body').should('contain', 'Cash On Delivery');
  });

});