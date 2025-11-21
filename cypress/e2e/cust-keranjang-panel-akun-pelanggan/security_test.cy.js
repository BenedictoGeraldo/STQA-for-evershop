describe('Skenario Pengujian Keamanan (TC-016 & TC-017)', () => {

  const userEmail = 'efulkabima0407@gmail.com';
  const userPass = 'Jakarta2004';
  
  // Payload XSS: Script sederhana
  const xssPayload = "<script>alert('XSS')</script>";
  // Payload HTML Injection: Coba bikin teks jadi tebal (bold)
  const htmlPayload = "<b>HACKED</b>";

  // --- TC-016: Proteksi Akses (Unauthenticated) ---
  // Test ini tidak butuh login di awal, jadi dia berdiri sendiri
  it('TC-016: User yang belum login harus di-redirect ke Login saat akses /account', () => {
    // 1. Hapus Sesi
    cy.clearCookies();
    cy.clearLocalStorage();

    // 2. Akses Paksa
    cy.visit('/account'); // Gunakan relative path jika baseUrl sudah di-set

    // 3. Validasi Redirect
    // URL harus pindah ke login
    cy.url().should('include', '/login');
    
    // Validasi elemen login muncul
    cy.get('input[name="email"]').should('be.visible');
    cy.contains(/Sign in|Login/i).should('be.visible');
  });

  // --- TC-017: Validasi Input XSS (Stored XSS) ---
  it('TC-017: Sistem harus menolak atau mensterilkan (Sanitize) input script berbahaya', () => {
    
    // A. SETUP: Login & Paksa Masuk Account (FIXED FLOW)
    cy.visit('/account/login');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();

    // [CRITICAL FIX] Tangani redirect ke Home
    cy.location('pathname').should('not.include', '/login');
    cy.visit('/account');
    cy.url().should('include', '/account');

    // B. ISI FORM ADD ADDRESS
    // Gunakan selector tombol yang sudah terbukti sukses di my_account.cy.js
    cy.contains('a', 'Add new address').click();
    cy.get('form').should('be.visible');

    // C. INJEKSI PAYLOAD (Input Data Berbahaya)
    cy.log('--- MENYUNTIKKAN PAYLOAD XSS ---');
    
    // Masukkan script berbahaya ke kolom Nama
    cy.get('input[name="full_name"]').clear().type(xssPayload);
    
    // Data wajib lainnya
    cy.get('input[name="telephone"]').type('08126666666');
    cy.get('input[name="address_1"]').type('Jl. Hacker No. 1337');
    cy.get('input[name="city"]').type('Cyberpunk City');
    cy.get('input[name="postcode"]').type('00000');
    
    // Pilih Negara & Provinsi (Fixed: Jakarta Raya)
    cy.get('select[name="country"]').select('ID');
    cy.wait(1000);
    cy.get('select[name="province"]').should('not.be.disabled').select('Jakarta Raya');

    // D. SIMPAN & TANGKAP ALERT
    // Kita pasang 'spy' di window:alert. Kalau alert muncul, test ini GAGAL (artinya sistem jebol).
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('form button[type="submit"]').click();

    // Tunggu server save (Intercept sebaiknya dipasang di beforeEach, tapi wait UI juga bisa)
    // Kita gunakan wait manual agar aman karena tidak setup intercept di 'it' ini
    cy.wait(3000); 
    cy.reload(); // Reload page untuk memastikan XSS tersimpan (Stored XSS) dijalankan saat render ulang

    // E. VALIDASI KEAMANAN (THE CRITICAL PART)
    
    // 1. Validasi Alert TIDAK Muncul
    cy.then(() => {
        expect(alertStub).to.not.be.called; 
    });

    // 2. Validasi Sanitasi HTML (Penting!)
    // Kita cari elemen alamat yang mengandung payload teks kita
    // Tujuannya: Memastikan text muncul, TAPI tag <script> tidak dieksekusi
    
    cy.contains(xssPayload).should('be.visible').then(($element) => {
        // Ambil HTML source dari elemen tersebut
        const rawHtml = $element.html();
        console.log('Rendered HTML:', rawHtml); // Cek di Console Browser

        // VALIDASI: Karakter < dan > harus diubah menjadi entity (&lt; &gt;)
        // Ini membuktikan browser menganggapnya teks, bukan kode.
        expect(rawHtml).to.not.contain('<script>'); 
        expect(rawHtml).to.contain('&lt;script&gt;'); 
    });

    cy.log('Security Test Passed: Payload dirender sebagai teks biasa (Escaped).');
  });

});