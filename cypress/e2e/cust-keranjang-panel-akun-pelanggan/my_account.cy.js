describe('Skenario My Account: Riwayat & Alamat (TC-011 s/d TC-013)', () => {
  
  const userEmail = 'user@email.com';
  const userPass = '123123123';

  // Variabel Global
  let timestamp;
  let newAddress;
  let editData;

  beforeEach(() => {
    // 1. GENERATE DYNAMIC DATA
    timestamp = Date.now();
    
    newAddress = {
      fullName: `Evan Baru ${timestamp}`,
      phone: '081299998888',
      address: 'Jl. Melati No. 45',
      city: 'Jakarta Selatan',
      postcode: '12190',
      province: 'Jakarta Raya'
    };
    
    editData = {
      fullName: `Evan Edit ${timestamp}`,
      phone: '081233334444',
      address: 'Jl. Perubahan No. 99',
      city: 'Jakarta Pusat'
    };

    // 2. CLEANUP STATE
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false); 

    // 3. INTERCEPT DEFINITIONS
    cy.intercept('POST', '**/customer/login').as('loginReq'); 
    cy.intercept('POST', '**/api/customers/**/addresses').as('createAddr');
    // Regex untuk menangkap method PATCH/PUT dan URL update
    cy.intercept({ method: /PUT|POST|PATCH/, url: '**/api/customers/**/addresses/*' }).as('updateAddr');
    // Regex untuk menangkap method DELETE
    cy.intercept('DELETE', '**/api/customers/**/addresses/*').as('deleteAddr');

    // 4. LOGIN FLOW
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();
    
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
    
    // Safety Wait (Wajib di Evershop agar session stabil)
    cy.log('--- WAITING FOR LOGIN STATE ---');
    cy.wait(1000); 
    
    cy.location('pathname', {timeout: 10000}).should('eq', '/');
    
    // 5. VISIT ACCOUNT
    cy.visit('/account');
    cy.contains('Account Information', {timeout: 10000}).should('be.visible');
  });

  // --- TC-011: Riwayat Pesanan ---
  it('TC-011: User dapat melihat riwayat pesanan (Order History)', () => {
    cy.get('body').then(($body) => {
        if ($body.find('.order-history-order').length > 0) {
            cy.get('.order-history-order').first().should('be.visible');
            cy.get('.order-history-order').first().within(() => {
                cy.get('.order-number').should('contain', 'Order: #');
                cy.get('.order-total-value').invoke('text').should('match', /[0-9]/);
            });
            cy.log('PASS: Riwayat pesanan ditemukan.');
        } else {
            cy.log('INFO: User belum memiliki riwayat pesanan (Fresh Account).');
            cy.contains(/Order History|My Orders/i).should('be.visible');
        }
    });
  });

  // --- TC-012: Tambah Alamat Baru (+ CLEANUP) ---
  it('TC-012: User dapat menambahkan alamat baru via Modal', () => {
    cy.contains('Address Book').scrollIntoView();
    
    cy.contains('a', 'Add new address').should('be.visible').click();
    cy.get('form').should('be.visible');

    // Isi Form
    cy.get('input[name="full_name"]').clear().type(newAddress.fullName);
    cy.get('input[name="telephone"]').clear().type(newAddress.phone);
    cy.get('input[name="address_1"]').clear().type(newAddress.address);
    cy.get('input[name="city"]').clear().type(newAddress.city);
    cy.get('input[name="postcode"]').clear().type(newAddress.postcode);
    cy.get('select[name="country"]').select('ID');
    cy.get('select[name="province"]').should('not.be.disabled').select(newAddress.province);

    // Simpan
    cy.get('form button[type="submit"]').click();
    cy.wait('@createAddr').its('response.statusCode').should('eq', 200);

    // Tutup Modal
    cy.get('body').type('{esc}');
    cy.get('form').should('not.exist');
    
    // Validasi Muncul
    cy.contains(newAddress.fullName).scrollIntoView().should('be.visible');

    // --- CLEANUP STEP (HAPUS ALAMAT INI) ---
    cy.log('--- CLEANUP: MENGHAPUS ALAMAT TC-012 ---');
    cy.contains(newAddress.fullName)
      .parents('.bg-white')
      .find('a')
      .contains(/Delete|Remove/i)
      .click();
      
    // Handle Alert Confirm
    cy.on('window:confirm', () => true);
    
    // Tunggu Delete Selesai
    cy.wait('@deleteAddr').its('response.statusCode').should('eq', 200);
    cy.contains(newAddress.fullName).should('not.exist');
  });

  // --- TC-013: Edit Alamat (+ CLEANUP) ---
  it('TC-013: User dapat mengedit alamat yang sudah ada', () => {
    // 1. PRE-CONDITION: Buat Alamat Dulu
    cy.contains('Address Book').scrollIntoView();
    cy.contains('a', 'Add new address').click();
    
    cy.get('input[name="full_name"]').type(newAddress.fullName);
    cy.get('input[name="telephone"]').type(newAddress.phone);
    cy.get('input[name="address_1"]').type(newAddress.address);
    cy.get('input[name="city"]').type(newAddress.city);
    cy.get('input[name="postcode"]').type(newAddress.postcode);
    cy.get('select[name="country"]').select('ID');
    cy.get('select[name="province"]').should('not.be.disabled').select(newAddress.province);
    cy.get('form button[type="submit"]').click();
    cy.wait('@createAddr');
    cy.get('body').type('{esc}');
    cy.get('form').should('not.exist');

    // 2. EDIT ALAMAT
    cy.contains(newAddress.fullName).scrollIntoView();

    cy.contains(newAddress.fullName)
      .parents('.bg-white')
      .find('a')
      .contains(/Edit/i)
      .should('be.visible')
      .click();

    cy.get('form').should('be.visible');

    // Ubah Data
    cy.get('input[name="full_name"]').clear().type(editData.fullName);
    cy.get('input[name="address_1"]').clear().type(editData.address);
    cy.get('input[name="city"]').clear().type(editData.city);

    // Simpan Perubahan
    cy.get('form button[type="submit"]').click();
    
    // Tunggu API PATCH/PUT
    cy.wait('@updateAddr').its('response.statusCode').should('eq', 200);
    
    cy.get('body').type('{esc}');
    cy.get('form').should('not.exist');

    // [CRITICAL] RELOAD PAGE UNTUK MEMASTIKAN DATA TERUPDATE DI SERVER
    // Ini mengatasi masalah "Nama lama masih muncul" karena cache UI
    cy.reload();
    cy.contains('Address Book', {timeout: 10000}).scrollIntoView().should('be.visible');

    // 3. VALIDASI EDIT
    cy.contains(newAddress.fullName).should('not.exist'); // Nama lama harus hilang
    cy.contains(editData.fullName).scrollIntoView().should('be.visible'); // Nama baru harus ada

    // --- CLEANUP STEP (HAPUS ALAMAT EDIT) ---
    cy.log('--- CLEANUP: MENGHAPUS ALAMAT TC-013 ---');
    cy.contains(editData.fullName)
      .parents('.bg-white')
      .find('a')
      .contains(/Delete|Remove/i)
      .click();
      
    cy.on('window:confirm', () => true);
    
    cy.wait('@deleteAddr').its('response.statusCode').should('eq', 200);
    cy.contains(editData.fullName).should('not.exist');
  });

});