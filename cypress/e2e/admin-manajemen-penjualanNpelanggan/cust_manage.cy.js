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

    // TC-018 Melihat detail pelanggan
    it('TC-018 - Admin dapat melihat detail pelanggan', () => {
        cy.visit('/admin/customers');

        // Klik baris pertama pelanggan
        cy.contains('Evan Test').click();
    });


    // TC-020 Validasi filter / pencarian pelanggan
    it('TC-020 - Validasi pencarian pelanggan dengan keyword "Evan"', () => {
        cy.visit('/admin/customers');

        // PERBAIKAN: Tambahkan .eq(1) untuk memilih kotak search kedua (search tabel)
        // Index 0 = Search Header (Salah)
        // Index 1 = Search Tabel Customers (Benar)
        cy.get('input[placeholder="Search"]')
          .eq(1) 
          .should('be.visible')
          .clear()
          .type('Evan{enter}'); // Tips: Sesuaikan nama dengan data yang ada di screenshot ("Evan") agar hasil tidak kosong

        cy.wait(1500); 

        // Validasi
        cy.get('table tbody tr').should('contain', 'Evan');
    });
})