describe('E2E Full Checkout Flow (TC-008, 009, 010)', () => {
  
  const userEmail = 'efulkabima0407@gmail.com';
  const userPass = 'Jakarta2004';
  
  const shippingData = {
    fullName: 'Evan Test',
    phone: '081234567890',
    address: 'Jl. Jenderal Sudirman No. 1',
    city: 'Jakarta Pusat',
    postcode: '12190',
    province: 'Jakarta Raya'
  };

  // Kita hanya gunakan SATU test block 'it()' untuk alur yang seamless
  it('TC-008/009/010: Full Flow - Login, Isi Alamat, & Validasi Sukses', () => {
    
    // --- SETUP AWAL ---
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.intercept('POST', '/api/graphql').as('graphqlRequest');

    cy.visit('http://localhost:3000/accessories/stainless-steel-thermos-yellow?color=3');
    cy.wait(2000);
    cy.contains('button', 'ADD TO CART').should('be.visible').click();
    cy.wait(3000); 
    cy.visit('http://localhost:3000/checkout');
    cy.url().should('include', '/checkout');
    cy.wait(2000); 

    // --- (Mulai TC-008) LOGIN ---
    cy.log('Langkah: Login (TC-008)');
    cy.get('body').contains('Log in').click();
    cy.wait(1000); 
    cy.get('input[name="contact.email"]').filter(':visible').clear().type(userEmail);
    cy.get('input[name="contact.password"]').filter(':visible').clear().type(userPass);
    cy.get('button').contains(/^Log in$/).should('be.visible').click();
    cy.wait(3000);
    cy.contains('Already have an account?').should('not.exist');
    cy.log('Langkah: Login Sukses');

    // --- (Mulai TC-009) ISI ALAMAT & PAYMENT ---
    // Karena kita tidak pindah 'it()', halaman tetap lanjut
    
    cy.log('Langkah: Mengisi Alamat (TC-009)');
    cy.get('input[name="shippingAddress.full_name"]').clear().type(shippingData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').clear().type(shippingData.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(shippingData.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(shippingData.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(shippingData.postcode);

    cy.log('Memilih Negara & Provinsi');
    cy.get('select[name="shippingAddress.country"]').select(1); 
    cy.wait(3000); 

    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select('Jakarta Raya'); 

    cy.wait(4000); // Tunggu Shipping Method Muncul

    cy.log('Memilih Metode Pengiriman');
    cy.get('body').then(($body) => {
        if ($body.find(':contains("Contoh Shipping")').length > 0) {
            cy.contains('Contoh Shipping').click({force: true});
            cy.contains('Contoh Shipping')
              .parents('div, label')
              .find('input[type="radio"]')
              .check({force: true});
        }
    });

    cy.wait(1000);

    cy.log('Memilih Pembayaran (Cash On Delivery)');
    cy.contains('span', 'Cash On Delivery')
      .parents('label, div') 
      .find('input[type="radio"]') 
      .check({force: true});

    cy.wait(1000);
    cy.log('Memastikan Billing Address');
    cy.contains('Same as shipping address').click({force: true});

    // --- (Mulai TC-010) PLACE ORDER & VALIDASI ---
    cy.wait(2000);
    cy.log('Langkah: Klik Place Order (TC-010)');
    
    cy.contains('button', 'Place Order')
      .should('not.be.disabled')
      .click();

    // Tunggu respons API
    cy.wait('@graphqlRequest', {timeout: 30000}).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
    });

    // Validasi URL Sukses (FIXED)
    cy.log('Validasi Halaman Sukses');
    // URL: http://localhost:3000/checkout/success/xxxx-xxxx
    cy.url({timeout: 10000}).should('include', '/checkout/success');
    
    // Validasi Ringkasan Pesanan (TC-010)
    cy.get('body').should('contain', 'Thank you'); // Atau pesan sukses lainnya
    cy.get('body').should('contain', shippingData.fullName); // Cek nama pengiriman
    cy.get('body').should('contain', shippingData.city); // Cek kota
    cy.get('body').should('contain', 'Cash On Delivery'); // Cek metode bayar
  });

});