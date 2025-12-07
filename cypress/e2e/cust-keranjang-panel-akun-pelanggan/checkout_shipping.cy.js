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
    province: 'Jakarta Raya'
  };

  beforeEach(() => {
    // Setup listener global untuk error exception
    cy.on('uncaught:exception', () => false);
  });

  // --- TC-009: Negative Test (Validation) ---
  it('TC-009: Validasi field wajib (Mandatory) saat Checkout - Negative Test', () => {
    // 1. Setup Cepat: Add to Cart & Checkout
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000);
    cy.visit('/checkout');
    
    // 2. Pastikan di halaman checkout
    cy.url().should('include', '/checkout');

    // 3. Action: Kosongkan Field Wajib & Blur
    cy.log('--- MENGOSONGKAN FIELD & TRIGGER VALIDASI ---');
    const mandatoryFields = [
      'shippingAddress.full_name',
      'shippingAddress.address_1',
      'shippingAddress.city',
      'shippingAddress.postcode',
      'shippingAddress.telephone'
    ];

    mandatoryFields.forEach((fieldName) => {
        // Blur() sangat penting untuk memicu validasi "touched" pada framework modern (React/Vue)
        cy.get(`input[name="${fieldName}"]`).clear({force: true}).blur(); 
    });

    // 4. Validasi: Pesan Error Harus Muncul (Tanpa Klik Tombol Continue)
    // Karena Evershop biasanya memunculkan error 'This field is required' segera setelah blur
    cy.get('body').then(($body) => {
        if ($body.text().includes('required')) {
            cy.contains(/required|wajib/i).should('be.visible');
            cy.log('PASS: Pesan error muncul setelah field dikosongkan.');
        } else {
            // Jika pesan error tidak muncul text-nya, kita coba paksa klik PLACE ORDER
            // Ini adalah "tembok terakhir" yang pasti menahan user
            cy.log('Pesan error belum muncul, mencoba klik Place Order untuk memancing...');
            
            // Pastikan kita sudah pilih shipping & payment dummy dulu (biar tombol place order aktif secara logika)
            // Tapi karena alamat kosong, harusnya error validasi memblokir
            
            cy.get('button').contains(/Place Order|Checkout/i).click({force: true});
            
            // Validasi: URL TIDAK BOLEH berubah ke success
            cy.url().should('include', '/checkout');
            cy.url().should('not.include', '/success');
            
            // Validasi: Cek input jadi merah/invalid
            cy.get('input[name="shippingAddress.full_name"]')
              .should('have.prop', 'validity')
              .its('valid').should('be.false');
        }
    });

    cy.log('PASS: Sistem berhasil menahan user dengan data kosong.');
  });

  // --- TC-008 & TC-010: Happy Path ---
  it('TC-008/010: Full Flow - Login, Isi Alamat Lengkap, & Validasi Sukses', () => {
    
    // --- SETUP LISTENER API ---
    cy.intercept('POST', '**/login').as('loginRequest'); 
    cy.intercept('POST', '**/shippingMethods').as('addShipping');
    cy.intercept('POST', '**/paymentMethods').as('addPayment');
    cy.intercept('POST', '**/graphql').as('placeOrder'); 

    // --- STEP 1: Add to Cart & Go to Checkout ---
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    
    cy.contains('button', 'ADD TO CART').should('be.visible').click();
    cy.wait(1000); 
    
    cy.visit('/checkout');
    cy.url().should('include', '/checkout');

    // --- STEP 2 (TC-008): LOGIN DI HALAMAN CHECKOUT ---
    cy.log('--- PROSES LOGIN ---');
    cy.contains('button, a', 'Log in').click();
    
    cy.get('input[name="contact.email"]').should('be.visible').clear().type(userEmail);
    cy.get('input[name="contact.password"]').should('be.visible').clear().type(userPass);
    
    cy.get('button').contains(/^Log in$/).click();

    cy.wait(2000); 
    cy.contains('Already have an account?').should('not.exist');

    // --- STEP 3: ISI ALAMAT (POSITIVE FLOW) ---
    cy.log('--- MENGISI ALAMAT PENGIRIMAN ---');
    cy.get('input[name="shippingAddress.full_name"]').clear().type(shippingData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').clear().type(shippingData.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(shippingData.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(shippingData.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(shippingData.postcode);

    cy.get('select[name="shippingAddress.country"]').select('ID'); 
    cy.wait(1000); 
    
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select(shippingData.province); 

    // --- STEP 4: PILIH SHIPPING METHOD ---
    cy.log('--- MEMILIH SHIPPING METHOD ---');
    cy.wait(3000); 

    cy.contains('Contoh Shipping')
      .closest('div')
      .click();

    cy.wait('@addShipping').its('response.statusCode').should('eq', 200);

    // --- STEP 5: PILIH PAYMENT ---
    cy.log('--- MEMILIH PAYMENT METHOD ---');
    cy.wait(1000);
    
    cy.contains('span', 'Cash On Delivery')
       .closest('div')
       .click();
       
    cy.wait(2000); 

    cy.get('#same-address').check({force: true});

    // --- STEP 6 (TC-010): PLACE ORDER & VALIDASI ---
    cy.log('--- KLIK PLACE ORDER ---');
    
    cy.get('button').contains('Place Order')
      .should('not.be.disabled')
      .click();

    cy.url({timeout: 30000}).should('include', '/checkout/success');
    
    cy.get('body').should('contain', 'Thank you');
    cy.get('body').should('contain', shippingData.fullName);
    cy.get('body').should('contain', 'Cash On Delivery');
  });

});