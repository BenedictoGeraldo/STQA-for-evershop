describe('Skenario Keamanan & Manajemen Akun (TC-036 s/d TC-039, TC-048)', () => {

  const userEmail = 'user@email.com'; 
  const userPass = '123123123';
  
  let dummyAddress; 

  beforeEach(() => {
    // 1. SETUP DATA DINAMIS (Timestamp)
    const timestamp = Date.now();
    dummyAddress = {
      fullName: `AutoTest ${timestamp}`, 
      phone: '081200009999',
      address: `Jl. Testing No. ${timestamp}`,
      city: 'Jakarta Barat',
      postcode: '11000',
      province: 'Jakarta Raya'
    };

    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);
    
    // 2. SETUP INTERCEPT
    cy.intercept('POST', '**/login').as('loginReq');
    cy.intercept('POST', '**/api/customers/**/addresses').as('createAddr'); 
    cy.intercept('DELETE', '**/api/customers/**/addresses/*').as('deleteAddr');
  });

  // --- HELPER: Login Manual ---
  const loginManual = () => {
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();
    
    cy.wait('@loginReq'); 
    cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    cy.visit('/account');
  };

  // --- TC-038: Security ---
  it('TC-038: Security - Redirect otomatis saat akses /checkout dengan keranjang kosong', () => {
    cy.visit('/checkout');
    cy.url().should('not.include', '/checkout');
    cy.log('PASS: Sistem mencegah akses checkout tanpa barang.');
  });

  // --- TC-048: Functional ---
  it('TC-048: Validasi keberadaan dan fungsi link "Forgot your password?"', () => {
    cy.visit('/account/login');
    cy.contains('a', 'Forgot your password?').should('be.visible').click();
    cy.url().should('include', '/reset-password');
    cy.get('input[name="email"]').should('be.visible');
  });

  // --- TC-037: Security ---
  it('TC-037: Security - Validasi Logout dan Tombol Back Browser', () => {
    loginManual();
    cy.contains('Logout', {timeout: 10000}).should('be.visible');
    cy.contains('a', 'Logout').click();
    cy.location('pathname').should('eq', '/'); 
    
    cy.log('--- TEKAN BACK BROWSER ---');
    cy.go('back');

    cy.location('pathname').then((path) => {
        if (path.includes('/account')) {
            cy.get('input[name="email"]').should('be.visible'); 
        } else {
            cy.location('pathname').should('not.eq', '/account');
        }
    });
  });

  // --- TC-036: Negative Test - Tambah Alamat Kosong ---
  it('TC-036: Negative Test - Validasi Form Tambah Alamat (Field Kosong)', () => {
    loginManual(); 

    // Buka Modal
    cy.contains('a', 'Add new address').click();
    cy.get('form').should('be.visible');

    // ACTION: Klik Submit Kosong
    cy.get('form button').contains(/Add address|Save/i).click();

    // VALIDASI:
    cy.get('input[name="full_name"]').then(($input) => {
        const isInvalid = $input[0].checkValidity() === false;
        
        if (!isInvalid) {
            cy.contains(/required|empty/i).should('exist');
        } else {
            expect(isInvalid).to.be.true;
        }
    });

    // TUTUP MODAL DENGAN ESC
    cy.get('body').type('{esc}');
  });

  // --- TC-039: Functional - Hapus Alamat ---
  it('TC-039: Functional - User dapat menghapus alamat dari Address Book', () => {
    loginManual(); 

    // 1. Buat Alamat Baru
    cy.contains('a', 'Add new address').click();
    cy.get('input[name="full_name"]').clear().type(dummyAddress.fullName);
    cy.get('input[name="telephone"]').clear().type(dummyAddress.phone);
    cy.get('input[name="address_1"]').clear().type(dummyAddress.address);
    cy.get('input[name="city"]').clear().type(dummyAddress.city);
    cy.get('input[name="postcode"]').clear().type(dummyAddress.postcode);
    cy.get('select[name="country"]').select('ID');
    cy.get('select[name="province"]').should('not.be.disabled').select(dummyAddress.province);
    
    cy.get('form button').contains(/Add address|Save/i).click();
    
    // Tunggu Simpan Berhasil
    cy.wait('@createAddr').its('response.statusCode').should('eq', 200);

    // TUTUP MODAL DENGAN 'ESC'
    cy.get('body').type('{esc}');
    
    // [CRITICAL FIX] ASSERT MODAL HILANG (Gunakan not.exist)
    // Ini sukses karena form benar-benar dihapus dari HTML
    cy.get('form').should('not.exist');

    // 2. ACTION: Hapus Alamat
    // Sekarang aman untuk klik Delete tanpa force
    cy.contains('.bg-white', dummyAddress.fullName) 
      .find('a, button') 
      .contains(/Delete|Remove/i)
      .should('be.visible')
      .click();
    
    cy.on('window:confirm', () => true);

    // Tunggu Delete Berhasil di Server
    cy.wait('@deleteAddr').its('response.statusCode').should('eq', 200);

    // 3. VALIDASI FINAL
    cy.contains(dummyAddress.fullName).should('not.exist');
    cy.log(`Alamat ${dummyAddress.fullName} berhasil dihapus.`);
  });

});