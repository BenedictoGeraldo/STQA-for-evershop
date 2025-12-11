describe('E2E Full Checkout Flow (TC-008, 009, 010)', () => {
  
  const userEmail = 'user@email.com';
  const userPass = '123123123';
  
  const shippingData = {
    fullName: 'Evan Test',
    phone: '081234567890',
    address: 'Jl. Jenderal Sudirman No. 1',
    city: 'Jakarta Pusat',
    postcode: '12190',
    province: 'Jakarta Raya'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);

    cy.intercept('POST', '**/api/cart/*/items').as('addToCart');
    cy.intercept('POST', '**/customer/login').as('loginReq'); 
    
    // Kita butuh ini untuk memastikan Shipping sudah "masuk" sebelum lanjut
    cy.intercept('POST', '**/api/graphql').as('graphqlOp');
  });

  it('TC-008/009/010: Full Flow - Login, Isi Alamat, & Validasi Sukses', () => {
    
    // --- STEP 1: Add to Cart ---
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').should('be.visible').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
    
    cy.visit('/checkout');

    // --- STEP 2: Login ---
    cy.log('--- PROSES LOGIN ---');
    cy.contains('button, a', 'Log in').click();
    
    cy.get('input[name="contact.email"]').should('be.visible').clear().type(userEmail);
    cy.get('input[name="contact.password"]').should('be.visible').clear().type(userPass);
    cy.get('button').contains(/^Log in$/).click();

    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
    
    cy.log('--- WAITING FOR PAGE RELOAD ---');
    cy.wait(3000); 

    cy.get('body').should('be.visible');

    // --- STEP 3: Isi Alamat ---
    cy.log('--- MENGISI ALAMAT PENGIRIMAN ---');
    
    cy.get('input[name="shippingAddress.full_name"]', {timeout: 10000})
      .should('be.visible')
      .should('not.be.disabled')
      .clear()
      .type(shippingData.fullName);

    cy.get('input[name="shippingAddress.telephone"]').clear().type(shippingData.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(shippingData.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(shippingData.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(shippingData.postcode);

    cy.get('select[name="shippingAddress.country"]').select('ID'); 
    
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select(shippingData.province); 

    // --- STEP 4: PILIH SHIPPING (METODE AGRESIF) ---
    cy.log('--- MEMILIH SHIPPING METHOD (AGRESIF) ---');
    
    // Tunggu opsi muncul
    cy.contains('Contoh Shipping', {timeout: 10000}).should('be.visible');

    // JURUS KLIK BERTUBI-TUBI (Sesuai pengalaman Anda)
    // 1. Klik Label Teksnya
    cy.contains('Contoh Shipping').click({force: true});
    
    // 2. Klik Kotak Pembungkusnya
    cy.contains('Contoh Shipping')
      .parents('.shipping-methods-list')
      .find('.border') // Kelas kotak pembungkus
      .first()
      .click({force: true});

    // 3. Klik Input Radionya (Force Check)
    cy.contains('Contoh Shipping')
      .parents('.shipping-methods-list')
      .find('input[type="radio"]')
      .first()
      .check({force: true});

    // PENTING: Tunggu Respons Server
    // Jika tidak ditunggu, aplikasi belum 'sadar' shipping terpilih saat kita klik Place Order
    cy.wait('@graphqlOp'); 
    cy.wait(1000); // Wait UI extra

    // --- STEP 5: PILIH PAYMENT (METODE AGRESIF) ---
    cy.log('--- MEMILIH PAYMENT METHOD (AGRESIF) ---');
    
    // Lakukan hal yang sama untuk Payment
    cy.contains('span', 'Cash On Delivery').should('be.visible');

    // 1. Klik Teks
    cy.contains('span', 'Cash On Delivery').click({force: true});
    
    // 2. Klik Kotak
    cy.contains('span', 'Cash On Delivery')
       .parents('.payment-methods-list')
       .find('.border')
       .first()
       .click({force: true});

    // 3. Check Radio
    cy.contains('span', 'Cash On Delivery')
       .parents('.payment-methods-list')
       .find('input[type="radio"]')
       .first()
       .check({force: true});
       
    // Tunggu Server Update Payment
    cy.wait('@graphqlOp'); 
    cy.wait(1000); 

    // --- STEP 6: PLACE ORDER ---
    cy.log('--- KLIK PLACE ORDER ---');
    
    // Pastikan tombol tidak disabled sebelum klik
    // Jika disabled, berarti shipping/payment gagal terpilih
    cy.get('button').contains('Place Order')
      .scrollIntoView()
      .should('not.be.disabled') 
      .click();

    // --- VALIDASI FINAL ---
    // Tambahkan timeout panjang karena proses order kadang lama
    cy.url({timeout: 40000}).should('include', '/checkout/success');
    
    cy.get('body').should('contain', 'Thank you');
    cy.get('body').should('contain', shippingData.fullName);
  });

});