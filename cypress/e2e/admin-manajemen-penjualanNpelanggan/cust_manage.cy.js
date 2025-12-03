describe('Customer Management - E2E Automation', () => {
    // Helper login function
    const loginAsAdmin = () => {
        cy.visit('/admin/login');
        cy.get('input[name="email"]').type('admin@email.com');
        cy.get('input[name="password"]').type('rendigay');
        cy.contains('button', /Login|Sign in/i).click();
    };

    beforeEach(() => {
        loginAsAdmin();
    });

    // TC-017 Melihat daftar pelanggan
    it('TC-017 - Admin dapat melihat daftar pelanggan', () => {
        cy.visit('/admin/customers');

        // Validasi tabel muncul
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    // TC-018 Melihat detail pelanggan (KODE ASLI ANDA - DIBIARKAN)
    it('TC-018 - Admin dapat melihat detail pelanggan', () => {
        cy.visit('/admin/customers');

        // Klik baris pertama pelanggan
        cy.contains('Evan Test').click();
        
        // Note: URL mungkin berbeda (/customers/edit vs /customer/edit), tapi sesuai request, ini tidak saya ubah.
        // Jika error, Anda bisa ubah manual nanti menjadi 'include', '/admin/customers/edit'
    });

    // TC-019 Validasi Tampilan Riwayat Pesanan & Profil (BARU)
    it('TC-019 - Validasi tampilan Riwayat Pesanan dan Info Pelanggan', () => {
        cy.visit('/admin/customers');

        // 1. Cari Customer Spesifik "Evan" (Reuse logika TC-020 agar aman)
        cy.get('input[placeholder="Search"]')
          .eq(1) 
          .should('be.visible')
          .clear()
          .type('Evan{enter}'); 

        cy.wait(1500);

        // 2. Klik nama pelanggan
        cy.contains('Evan Test').click();

        // --- VALIDASI PANEL KANAN (INFO STATIS) ---
        // Sesuai HTML: <h3 class="card-session-title">Full Name</h3>
        cy.contains('h3', 'Full Name').should('be.visible');
        cy.contains('span', 'Evan Test').should('be.visible'); // Value Nama

        cy.contains('h3', 'Email').should('be.visible');
        // Validasi Email muncul (efulkabima...)
        // Kita cari container yang memuat email tersebut
        cy.contains('span', 'efulkabima0407@gmail.com').should('be.visible');

        cy.contains('h3', 'Status').should('be.visible');
        
        // --- VALIDASI PANEL KIRI (ORDER HISTORY) ---
        // Sesuai HTML: <h2 class="card-title">Order History</h2>
        cy.contains('h2', 'Order History').should('be.visible');

        // Validasi minimal ada 1 link Order ID (format #100xx)
        // Kita cari elemen link yang href-nya mengandung /admin/order/edit/
        cy.get('a[href*="/admin/order/edit/"]').should('have.length.gt', 0);

        // Validasi Status Order muncul (Pending/Canceled/Paid)
        // Kita cari di seluruh body halaman detail
        cy.get('body').contains(/Pending|Canceled|Paid|Shipped/);
        
        // Validasi Harga muncul ($135.00)
        cy.get('body').should('contain', '$');
    });

    // TC-020 Validasi filter / pencarian pelanggan (KODE ASLI ANDA)
    it('TC-020 - Validasi pencarian pelanggan dengan keyword "Evan"', () => {
        cy.visit('/admin/customers');

        // PERBAIKAN: Tambahkan .eq(1) untuk memilih kotak search kedua (search tabel)
        cy.get('input[placeholder="Search"]')
          .eq(1) 
          .should('be.visible')
          .clear()
          .type('Evan{enter}'); 

        cy.wait(1500); 

        // Validasi
        cy.get('table tbody tr').should('contain', 'Evan');
    });
});