describe('Skenario Pengujian Keamanan (TC-016 & TC-017)', () => {

  const userEmail = 'efulkabima0407@gmail.com';
  const userPass = 'Jakarta2004';
  const xssPayload = "<script>alert('XSS')</script>";

  // --- TC-016: Proteksi Akses Halaman Akun (Unauthenticated) ---
  it('TC-016: User yang belum login harus di-redirect ke halaman Login saat mengakses /account', () => {
    // 1. Pastikan session bersih (Logout/Guest)
    cy.clearCookies();
    cy.clearLocalStorage();

    // 2. Coba paksa masuk ke halaman akun
    cy.visit('http://localhost:3000/account');

    // 3. Validasi Redirect
    // System harusnya menolak dan melempar ke halaman login
    cy.url().should('include', '/login'); // URL harus mengandung kata login
    
    // Validasi elemen login muncul
    cy.get('input[name="email"]').should('be.visible');
    cy.get('button').contains(/Sign in|Login/i).should('be.visible');
  });

  // --- TC-017: Validasi Input XSS pada Form Alamat ---
  it('TC-017: Sistem harus menolak atau mensterilkan input script berbahaya (XSS)', () => {
    // --- PRECONDITION: Login Dulu ---
    cy.visit('http://localhost:3000/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();
    cy.wait(2000);
    cy.visit('http://localhost:3000/account');

    // 1. Buka Menu Address Book & Add Address
    cy.contains('h2', 'Address Book').click();
    cy.wait(1000);
    cy.contains(/Add.*Address/i).click();
    cy.wait(1000);

    // 2. Input Payload XSS ke Field Nama
    cy.log('Mencoba menyuntikkan script XSS...');
    cy.get('input[name="full_name"]').filter(':visible').clear().type(xssPayload);
    
    // Isi sisa form dengan data dummy valid
    cy.get('input[name="telephone"]').filter(':visible').type('0812000000');
    cy.get('input[name="address_1"]').filter(':visible').type('Jl. Aman No. 1');
    cy.get('input[name="city"]').filter(':visible').type('Jakarta Selatan');
    cy.get('input[name="postcode"]').filter(':visible').type('12190');
    
    cy.get('select[name="country"]').filter(':visible').select(1);
    cy.wait(2000);
    cy.get('select[name="province"]').filter(':visible').select('Jakarta Raya');

    // 3. Simpan Alamat
    // Kita setup listener untuk menangkap jika ada "window.alert" muncul (Tanda XSS berhasil/jebol)
    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.get('button').contains(/Save|Add/i).filter(':visible').click();
    cy.wait(2000);

    // 4. Validasi Keamanan (Security Assertion)
    // a. Pastikan TIDAK ADA alert browser yang muncul
    cy.then(() => {
        expect(stub).to.not.be.called; 
    });

    // b. Validasi Text di Layar
    // Script XSS harusnya ditampilkan sebagai TEXT BIASA atau DIBERSIHKAN, bukan dieksekusi
    // Kita cari teks payload tadi di body
    cy.get('body').then(($body) => {
        const bodyText = $body.text();
        // Jika text "<script>..." muncul sebagai tulisan biasa, itu AMAN.
        // Jika elemen <script> tertanam di DOM dan hilang dari pandangan, itu BAHAYA.
        // Tapi validasi paling penting adalah stub alert di atas.
        cy.log('Tes XSS Selesai. Jika tidak ada alert muncul, sistem aman.');
    });

    // c. Cleanup (Hapus alamat sampah ini agar tidak mengotori akun)
    // Kita cari kartu alamat yang mengandung script tadi dan hapus
    // Note: Cypress mungkin kesulitan mencari teks "<script>" literal, jadi kita skip delete otomatis 
    // atau hapus manual nanti jika perlu.
  });

});