describe('Skenario Keamanan & Manajemen Akun (TC-036 s/d TC-039, TC-048)', () => {

  const userEmail = 'user@email.com';
  const userPass = '123123123';
  const timestamp = Date.now();
  
  // Data untuk TC Delete & Negative
  const dummyAddress = {
    fullName: `To Delete ${timestamp}`,
    phone: '081200009999',
    address: 'Jl. Hapus Nanti No. 0',
    city: 'Jakarta Barat',
    postcode: '11000',
    province: 'Jakarta Raya'
  };

  // Setup Umum
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);
    
    // --- INTERCEPT ---
    cy.intercept('POST', '**/login').as('loginReq');
    cy.intercept('POST', '**/graphql').as('graphqlOp');
    cy.intercept('POST', '**/api/customers/**/addresses').as('createAddr');
    cy.intercept('DELETE', '**/api/customers/**/addresses/*').as('deleteAddr');
  });

  // --- TC-038: Security - Akses Paksa Checkout (PASS) ---
  it('TC-038: Security - Redirect otomatis saat akses /checkout dengan keranjang kosong', () => {
    cy.visit('/');
    cy.visit('/checkout');
    cy.url().should('not.include', '/checkout');
    cy.contains('Contact Information').should('not.exist');
    cy.log('PASS: Sistem mencegah akses checkout tanpa barang.');
  });

  // --- TC-048: Functional - Forgot Password Link (PASS) ---
  it('TC-048: Validasi keberadaan dan fungsi link "Forgot your password?"', () => {
    cy.visit('/account/login');
    cy.contains('a', 'Forgot your password?')
      .should('be.visible')
      .and('have.attr', 'href')
      .and('include', 'reset-password'); 
    
    cy.contains('a', 'Forgot your password?').click();
    cy.url().should('include', '/reset-password');
    cy.get('input[name="email"]').should('be.visible');
  });

  // --- TC-037: Security - Logout & Back Button (FIXED LOGIN) ---
  it('TC-037: Security - Validasi Logout dan Tombol Back Browser (Session Termination)', () => {
    // 1. Login
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();
    
    // [CRITICAL FIX] Tunggu Login Selesai & Redirect ke Home dulu
    cy.wait('@loginReq');
    cy.location('pathname', {timeout: 10000}).should('eq', '/');

    // 2. Baru Pindah ke Akun (Cookie sudah aman)
    cy.visit('/account');
    cy.contains('Logout', {timeout: 10000}).should('be.visible');

    // 3. ACTION: Logout
    cy.contains('a', 'Logout').click();

    // Validasi Logout
    cy.location('pathname').should('eq', '/'); 
    cy.contains('Logout').should('not.exist');

    // 4. ACTION: Tekan Tombol Back Browser
    cy.log('--- TEKAN BACK BROWSER ---');
    cy.go('back');

    // 5. VALIDASI SECURITY
    cy.location('pathname').then((path) => {
        if (path === '/account') {
            // Jika URL /account, pastikan isinya Login Form (Bukan Dashboard)
            cy.get('input[name="email"]').should('be.visible');
            cy.contains('My Account').should('not.exist');
        } else {
            cy.location('pathname').should('not.eq', '/account');
        }
    });
  });

  // --- TC-036: Negative Test - Tambah Alamat Kosong (FIXED LOGIN) ---
  it('TC-036: Negative Test - Validasi Form Tambah Alamat (Field Kosong)', () => {
    // Login
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();
    
    // [CRITICAL FIX] Tunggu Redirect Home
    cy.wait('@loginReq');
    cy.location('pathname', {timeout: 10000}).should('eq', '/');
    
    // Masuk Address Book
    cy.visit('/account');

    // Buka Modal Add Address
    cy.contains('a', 'Add new address', {timeout: 10000}).click();
    cy.get('form').should('be.visible');

    // ACTION: Langsung Klik Submit
    cy.get('form button').contains(/Add address|Save/i).click();

    // VALIDASI: Cek Pesan Error Visual
    cy.get('form').within(() => {
        cy.contains(/required|empty/i).should('be.visible');
    });

    cy.get('form').should('be.visible');
  });

  // --- TC-039: Functional - Hapus Alamat (FIXED LOGIN) ---
  it('TC-039: Functional - User dapat menghapus alamat dari Address Book', () => {
    // Login
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();
    
    // [CRITICAL FIX] Tunggu Redirect Home
    cy.wait('@loginReq');
    cy.location('pathname', {timeout: 10000}).should('eq', '/');

    // Visit Account
    cy.visit('/account');

    // 1. Buat Alamat Dummy
    cy.contains('a', 'Add new address', {timeout: 10000}).click();
    cy.get('input[name="full_name"]').type(dummyAddress.fullName);
    cy.get('input[name="telephone"]').type(dummyAddress.phone);
    cy.get('input[name="address_1"]').type(dummyAddress.address);
    cy.get('input[name="city"]').type(dummyAddress.city);
    cy.get('input[name="postcode"]').type(dummyAddress.postcode);
    cy.get('select[name="country"]').select('ID');
    cy.wait(1000);
    cy.get('select[name="province"]').select(dummyAddress.province);
    
    cy.get('form button').contains(/Add address|Save/i).click();
    
    // Tunggu API Create
    cy.wait('@createAddr').its('response.statusCode').should('eq', 200);
    cy.wait(1000);
    cy.get('body').type('{esc}');

    // Validasi alamat dummy muncul
    cy.contains(dummyAddress.fullName).should('be.visible');

    // 2. ACTION: Hapus Alamat
    cy.contains(dummyAddress.fullName)
      .parents('.bg-white') 
      .find('a, button')
      .contains(/Delete|Remove/i)
      .click();
      
    // Tunggu API Delete
    cy.wait('@deleteAddr').its('response.statusCode').should('eq', 200);

    // 3. VALIDASI: Alamat hilang
    cy.wait(1000);
    cy.contains(dummyAddress.fullName).should('not.exist');
    
    cy.log(`Alamat ${dummyAddress.fullName} berhasil dihapus.`);
  });

});