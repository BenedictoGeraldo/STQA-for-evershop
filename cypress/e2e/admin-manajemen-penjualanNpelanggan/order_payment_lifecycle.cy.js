describe('Manajemen Penjualan - Alur Pembayaran (Payment)', () => {

    const loginAsAdmin = () => {
        cy.visit('/admin/login');
        cy.get('input[name="email"]').type('admin@email.com');
        cy.get('input[name="password"]').type('rendigay');
        cy.contains(/Login|Sign in/i).click();
        cy.url().should('include', '/admin');
    };

    beforeEach(() => {
        loginAsAdmin();
        cy.visit('/admin/orders');
    });

    // TC-007: Mengubah Payment Status menjadi Paid (Capture)
    it('TC-007: Mengubah Payment Status menjadi Paid (Capture)', () => {
        // 1. FILTER: Cari order dengan Payment Status "Pending"
        // Gunakan regex agar tidak error huruf besar/kecil
        cy.contains('span', /Payment [sS]tatus/).should('be.visible').click();
        
        // Pilih "Pending"
        cy.wait(500);
        cy.get('ul li a').contains(/^Pending$/).should('be.visible').click();
        
        cy.wait(1500); // Tunggu filter loading

        // 2. Pilih order baris data pertama (Index 1)
        cy.get('table.listing tbody tr', {timeout: 10000})
          .eq(1).should('exist')
          .find('a[href*="/admin/order/edit/"]')
          .click();

        // 3. KLIK TOMBOL CAPTURE
        // Tombol ini mengubah status dari Pending -> Paid
        cy.contains('button', 'Capture').should('be.visible').click();

        // 4. VALIDASI STATUS PAID
        cy.wait(2000); 
        // Validasi bahwa tombol Capture sudah HILANG (artinya sudah terproses)
        cy.contains('button', 'Capture').should('not.exist');
        
        // Validasi Badge/Teks berubah jadi Paid
        // Kita cari teks "Paid" di halaman
        cy.get('body').should('contain', 'Paid');
        
        cy.log('Sukses: Order telah di-Capture menjadi Paid.');
    });

    // TC-008: Membatalkan Pembayaran (Via Cancel Order)
    it('TC-008: Membatalkan Pembayaran (Payment Canceled)', () => {
        // 1. FILTER: Cari order Pending
        cy.contains('span', /Payment [sS]tatus/).click();
        cy.wait(500);
        cy.get('ul li a').contains(/^Pending$/).click();
        cy.wait(1500);
        
        // 2. Pilih order. 
        // Ambil baris ke-2 (eq 2) untuk keamanan (agar tidak ambil order yg baru di-capture)
        // Jika tidak ada baris ke-2, ambil baris ke-1.
        cy.get('table.listing tbody tr').then(($rows) => {
            if ($rows.length > 2) {
                cy.wrap($rows).eq(2).find('a[href*="/admin/order/edit/"]').click();
            } else {
                cy.wrap($rows).eq(1).find('a[href*="/admin/order/edit/"]').click();
            }
        });

        // 3. Klik Cancel Order
        cy.contains('button', 'Cancel Order').click();
        
        // 4. Isi Reason
        cy.wait(500);
        cy.get('textarea[placeholder*="Reason"]')
          .filter(':visible')
          .type('Payment Canceled Test');
          
        cy.contains('Submit Cancellation').click();

        // 5. VALIDASI
        cy.wait(1500);
        cy.get('body').should('contain', 'Canceled');
    });

});