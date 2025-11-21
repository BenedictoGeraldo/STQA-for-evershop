describe('Skenario Validasi & Reliability Checkout (Single Page Flow)', () => {

  const invalidEmail = 'budi.com'; // Tanpa @
  const invalidPhone = 'NomorHP'; // Huruf
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
    // Menangani error 500/uncaught exception agar test tidak berhenti (Penting untuk Reliability Test)
    cy.on('uncaught:exception', () => false);

    // INTERCEPT
    cy.intercept('POST', '**/api/cart/mine/items').as('addToCart');
    cy.intercept('GET', '**/shippingMethods').as('getShippingMethods'); 
    
    // 1. Add Product
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart');
    
    // 2. Visit Checkout
    cy.visit('/checkout');
  });

  // --- TC-029: Negative Test Email (PASS) ---
  it('TC-029: Validasi Format Email Tidak Valid (Tanpa @)', () => {
    cy.get('input[name="contact.email"]').type(invalidEmail);
    cy.get('input[name="shippingAddress.full_name"]').click(); // Trigger blur

    // Validasi: Pesan error harus muncul
    cy.get('input[name="contact.email"]')
      .parent()
      .should('contain.text', 'valid'); 
      
    // Tombol submit harus disabled
    cy.get('button[type="submit"]').should('be.disabled');
  });

  // --- TC-034: Negative Test Provinsi Wajib (PASS) ---
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
    cy.get('.shipping-methods-list')
      .find('input[type="radio"]')
      .should('not.exist');
      
    // Tombol final disabled
    cy.get('button[type="submit"]').should('be.disabled');
  });

  // --- TC-030: Validasi No HP Huruf (BUG CONFIRMATION) ---
  it('TC-030: Verifikasi Input No HP Huruf (Temuan Bug: Validasi Lemah)', () => {
    cy.get('input[name="contact.email"]').type(validData.email);
    
    // ACTION: Input Huruf di No HP
    cy.get('input[name="shippingAddress.telephone"]').type(invalidPhone);
    cy.get('input[name="shippingAddress.full_name"]').click(); // Trigger blur

    // VALIDASI BUG (Agar test hijau):
    // Kita assert bahwa sistem TIDAK memunculkan error (karena memang bug-nya begitu)
    // Jika script ini hijau, berarti BUG TERKONFIRMASI ada.
    
    cy.get('input[name="shippingAddress.telephone"]')
      .parent()
      .invoke('text')
      .should('not.match', /valid|number/i); // Memastikan TIDAK ada pesan error

    // LOG TEMUAN (Akan muncul di Cypress Command Log)
    cy.log('**[TEMUAN BUG]** Sistem menerima input huruf pada field Telepon tanpa pesan error!');
  });

  // --- TC-032: Alamat Panjang (PASS) ---
  it('TC-032: Validasi Input Alamat Sangat Panjang (Boundary)', () => {
    cy.get('input[name="contact.email"]').type(validData.email);
    
    cy.get('input[name="shippingAddress.full_name"]').type(validData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').type(validData.phone);
    
    // Input Alamat Panjang
    cy.get('input[name="shippingAddress.address_1"]').type(longAddress, {delay: 0});
    
    cy.get('input[name="shippingAddress.city"]').type(validData.city);
    cy.get('input[name="shippingAddress.postcode"]').type(validData.postcode);
    cy.get('select[name="shippingAddress.country"]').select('ID');
    
    // Gunakan wait statis kecil sebelum pilih provinsi agar dropdown stabil
    cy.wait(1000);
    cy.get('select[name="shippingAddress.province"]').select(validData.province);

    // VALIDASI: Shipping Method MUNCUL (Tanda sistem backend tidak crash)
    // Gunakan timeout panjang agar Cypress sabar menunggu response
    cy.get('.shipping-methods-list input[type="radio"]', {timeout: 15000})
      .should('exist');
    
    // Pastikan bisa diklik
    cy.contains('Contoh Shipping').closest('div').click();
    cy.contains('Payment').should('be.visible');
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
    cy.get('select[name="shippingAddress.province"]').select(validData.province);
    
    // Tunggu shipping muncul
    cy.wait(2000);

    // 2. REFRESH
    cy.log('--- MELAKUKAN REFRESH ---');
    cy.reload();

    // 3. VALIDASI PERILAKU BUG/LIMITASI (Agar test hijau):
    // Kita assert bahwa data MEMANG HILANG (sesuai kondisi lapangan)
    cy.get('input[name="contact.email"]').should('have.value', '');
    
    // LOG TEMUAN
    cy.log('**[INFO/BUG]** Data Guest User hilang sepenuhnya setelah refresh page (State tidak disimpan).');
  });

});