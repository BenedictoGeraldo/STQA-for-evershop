describe('Customer Management - E2E Automation', () => {
    // Helper login function
    const loginAsAdmin = () => {
        cy.visit('/admin/login');
        cy.get('input[name="email"]').type('admin@email.com');
        cy.get('input[name="password"]').type('rendigay');
        cy.get('button[type="submit"]').click();
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
        cy.contains('rendi bot').click();
    });

    // TC-019 Validasi riwayat pesanan pelanggan
    it('TC-019 - Validasi riwayat pesanan tampil lengkap dan urut', () => {
        cy.visit('/admin/customers');
        // Validasi tabel muncul
        cy.get('table tbody tr').should('have.length.greaterThan', 0);

        // Klik tab "Riwayat Pesanan"
        cy.contains('Riwayat Pesanan').click();

        // Validasi daftar pesanan muncul
        cy.get('.order-history-item').should('have.length.greaterThan', 0);

        // Validasi urut DESC (tanggal terbaru paling atas)
        cy.get('.order-date').then($dates => {
            const values = [...$dates].map(el => new Date(el.innerText));
            const sorted = [...values].sort((a, b) => b - a);
            expect(values).to.deep.equal(sorted);
        });
    });

    // TC-020 Validasi filter / pencarian pelanggan
    it('TC-020 - Validasi pencarian pelanggan dengan keyword "Budi"', () => {
        cy.contains('Manajemen Pelanggan').click();

        cy.get('input[placeholder="Search"]').type('Budi');

        // Validasi hasil filter hanya berisi nama yang mengandung "Budi"
        cy.get('table tbody tr').each($row => {
            cy.wrap($row).contains(/Budi/i);
        });
    });

});
