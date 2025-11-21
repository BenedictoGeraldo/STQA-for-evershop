describe('Skenario My Account: Riwayat & Alamat (TC-011 s/d TC-013)', () => {
  
  const userEmail = 'efulkabima0407@gmail.com';
  const userPass = 'Jakarta2004';

  // DATA DINAMIS
  const timestamp = Date.now(); 
  const newAddress = {
    fullName: `Evan Baru ${timestamp}`,
    phone: '081299998888',
    address: 'Jl. Melati No. 45',
    city: 'Jakarta Selatan',
    postcode: '12190',
    province: 'Jakarta Raya'
  };
  
  const editData = {
    fullName: `Evan Edit ${timestamp}`,
    phone: '081233334444',
    address: 'Jl. Perubahan No. 99',
    city: 'Jakarta Pusat'
  };

  beforeEach(() => {
    cy.visit('/account/login');
    cy.on('uncaught:exception', () => false); 

    cy.get('input[name="email"]').clear().type(userEmail);
    cy.get('input[name="password"]').clear().type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();

    cy.location('pathname').should('not.include', '/login');
    cy.visit('/account');
    
    cy.intercept('POST', '**/graphql').as('graphqlRequest'); 
  });

  it('TC-011: User dapat melihat riwayat pesanan (Order History)', () => {
    cy.get('.order-history-order').should('exist').and('be.visible');
    cy.get('.order-history-order').first().within(() => {
        cy.get('.order-number').should('contain', 'Order: #');
        cy.get('.order-total-value').should('contain', '$');
    });
  });

  it('TC-012: User dapat menambahkan alamat baru via Modal', () => {
    cy.contains('a', 'Add new address').click();
    cy.get('form').should('be.visible');

    cy.get('input[name="full_name"]').clear().type(newAddress.fullName);
    cy.get('input[name="telephone"]').clear().type(newAddress.phone);
    cy.get('input[name="address_1"]').clear().type(newAddress.address);
    cy.get('input[name="city"]').clear().type(newAddress.city);
    cy.get('input[name="postcode"]').clear().type(newAddress.postcode);

    cy.get('select[name="country"]').select('ID');
    cy.wait(1000); 
    cy.get('select[name="province"]').should('not.be.disabled').select(newAddress.province);

    cy.get('form button[type="submit"]').click();
    
    // 1. Tunggu Server (Wajib)
    cy.wait('@graphqlRequest').its('response.statusCode').should('eq', 200);

    // 2. Tunggu UI Stabil (PENTING)
    // Beri waktu 1 detik agar transisi 'saving' selesai dan event listener aktif kembali
    cy.wait(1000); 

    // 3. STRATEGI BARU: Tekan ESCAPE
    // Ini lebih reliable daripada klik koordinat mouse
    cy.get('body').type('{esc}');
    
    // Fallback: Jika ESC tidak mempan, kita coba klik paksa di koordinat berbeda (10, 10)
    // cy.get('body').click(10, 10, {force: true}); 

    // 4. Validasi Modal Hilang
    cy.get('form').should('not.exist');
    
    // 5. Validasi Data Muncul
    cy.contains(newAddress.fullName, {timeout: 10000}).should('be.visible');
  });

  it('TC-013: User dapat mengedit alamat yang sudah ada', () => {
    cy.contains(newAddress.fullName)
      .parents('.bg-white') 
      .find('a')
      .contains('Edit')
      .click();

    cy.get('form').should('be.visible');

    cy.get('input[name="full_name"]').clear().type(editData.fullName);
    cy.get('input[name="address_1"]').clear().type(editData.address);
    cy.get('input[name="city"]').clear().type(editData.city);

    cy.get('form button[type="submit"]').click();
    
    // 1. Tunggu Server
    cy.wait('@graphqlRequest').its('response.statusCode').should('eq', 200);
    
    // 2. Tunggu UI Stabil
    cy.wait(1000);

    // 3. Tekan ESCAPE
    cy.get('body').type('{esc}');

    // 4. Validasi Modal Hilang
    cy.get('form').should('not.exist');

    // 5. Validasi Perubahan
    cy.contains(editData.fullName, {timeout: 10000}).should('be.visible');
    cy.contains(newAddress.fullName).should('not.exist');
  });

});