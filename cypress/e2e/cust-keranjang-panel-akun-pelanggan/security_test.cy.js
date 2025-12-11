describe('Skenario Pengujian Keamanan (TC-016 & TC-017)', () => {

  const userEmail = 'user@email.com';
  const userPass = '123123123';
  
  // Payload XSS: Script sederhana
  // Kita tambahkan timestamp agar unik dan mudah dicari saat cleanup
  const timestamp = Date.now();
  const xssPayload = `<script>alert('XSS_${timestamp}')</script>`; 
  const safeText = `XSS Check ${timestamp}`; // Teks aman untuk identifikasi

  // Setup Global
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);

    // INTERCEPT
    cy.intercept('POST', '**/customer/login').as('loginReq');
    cy.intercept('POST', '**/api/customers/**/addresses').as('createAddr');
    // Intercept delete untuk cleanup
    cy.intercept('DELETE', '**/api/customers/**/addresses/*').as('deleteAddr');
  });

  // --- TC-016: Proteksi Akses (Unauthenticated) ---
  it('TC-016: User yang belum login harus di-redirect ke Login saat akses /account', () => {
    // 1. Akses Paksa URL Account tanpa login
    cy.visit('/account');

    // 2. Validasi Redirect
    // URL harus berakhir di /login
    cy.url().should('include', '/login');
    
    // Validasi elemen login muncul
    cy.get('input[name="email"]').should('be.visible');
    cy.contains(/Sign in|Login/i).should('be.visible');
    
    // Validasi pesan error (Opsional, jika ada flash message "Please login first")
    // cy.contains(/login first|authorized/i).should('exist');
  });

  // --- TC-017: Validasi Input XSS (Stored XSS) + Cleanup ---
  it('TC-017: Sistem harus menolak atau mensterilkan (Sanitize) input script berbahaya', () => {
    
    // 1. Login Flow
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();

    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
    
    // Safety Wait
    cy.log('--- WAITING FOR LOGIN STATE ---');
    cy.wait(3000); 
    cy.location('pathname', {timeout: 10000}).should('eq', '/');

    // 2. Masuk Account & Buka Modal
    cy.visit('/account');
    cy.contains('Account Information', {timeout: 10000}).should('be.visible');
    
    // Scroll agar tombol visible (Fix layout issue)
    cy.contains('Address Book').scrollIntoView();
    cy.contains('a', 'Add new address').should('be.visible').click();
    cy.get('form').should('be.visible');

    // 3. INJEKSI PAYLOAD (XSS)
    // Kita gabungkan payload XSS dengan teks aman agar elemen tetap bisa dicari via cy.contains
    const fullPayload = `${xssPayload} ${safeText}`;
    
    cy.log('--- MENYUNTIKKAN PAYLOAD XSS ---');
    cy.get('input[name="full_name"]').clear().type(fullPayload, {parseSpecialCharSequences: false});
    // parseSpecialCharSequences: false agar karakter { atau } tidak dianggap command Cypress
    
    // Isi data wajib lain
    cy.get('input[name="telephone"]').type('08126666666');
    cy.get('input[name="address_1"]').type('Jl. Hacker No. 1337');
    cy.get('input[name="city"]').type('Cyberpunk City');
    cy.get('input[name="postcode"]').type('00000');
    
    cy.get('select[name="country"]').select('ID');
    cy.get('select[name="province"]').should('not.be.disabled').select('Jakarta Raya');

    // 4. PASANG SPY ALERT
    // Jika alert browser muncul, stub ini akan terpanggil
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    // 5. SIMPAN
    cy.get('form button[type="submit"]').click();
    cy.wait('@createAddr').its('response.statusCode').should('eq', 200);
    
    // Tutup Modal
    cy.get('body').type('{esc}');
    cy.get('form').should('not.exist');

    // [CRITICAL] RELOAD PAGE
    // Stored XSS biasanya dieksekusi saat halaman diload ulang dan browser merender HTML kotor
    cy.reload();
    cy.contains('Address Book', {timeout: 10000}).scrollIntoView().should('be.visible');

    // 6. VALIDASI KEAMANAN
    
    // A. Pastikan Alert TIDAK Muncul
    cy.then(() => {
        expect(alertStub).to.not.be.called; 
    });

    // B. Pastikan Payload Tampil sebagai TEXT, bukan HTML
    // Kita cari container kartu alamat berdasarkan teks unik 'safeText'
    cy.contains(safeText).parent().then(($el) => {
        const htmlContent = $el.html();
        cy.log('Rendered HTML:', htmlContent);
        
        // Assert: Tag <script> harus tidak ada (karena di-escape jadi &lt;script&gt;)
        // Atau browser tidak merender elemen <script> aktif di dalam div ini
        expect(htmlContent).to.not.contain('<script>');
        
        // Assert: Teks payload harus ada (membuktikan data tersimpan)
        expect($el.text()).to.contain("alert('XSS_");
    });

    cy.log('PASS: XSS Payload tidak dieksekusi.');

    // 7. CLEANUP (HAPUS DATA SAMPAH)
    cy.log('--- CLEANUP DATA XSS ---');
    cy.contains(safeText)
      .parents('.bg-white')
      .find('a')
      .contains(/Delete|Remove/i)
      .click();
      
    cy.on('window:confirm', () => true);
    cy.wait('@deleteAddr').its('response.statusCode').should('eq', 200);
    cy.contains(safeText).should('not.exist');
  });

});