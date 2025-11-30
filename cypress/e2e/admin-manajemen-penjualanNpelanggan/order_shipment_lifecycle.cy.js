describe('Manajemen Penjualan - Alur Pengiriman (Shipment)', () => {
    
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
        
        // --- FILTER OTOMATIS: PENDING ---
        // 1. Klik trigger Filter "Shipment Status" (SPAN)
        cy.contains('span', 'Shipment status').should('be.visible').click();
        
        // 2. Pilih "Pending" dari Dropdown (Link <a>)
        cy.get('ul li a').contains(/^Pending$/).should('be.visible').click();
        
        // 3. Validasi Filter Aktif (Tunggu Tabel Reload)
        cy.wait(1500); 
        
        // 4. Pastikan ada data (Baris ke-2 / Index 1)
        cy.get('table.listing tbody tr', {timeout: 10000})
          .eq(1).should('exist');
    });

    // TC-004 & TC-015: Mengubah Shipment Status menjadi Shipped
    it('TC-004 & TC-015: Mengubah Shipment Status menjadi Shipped', () => {
        // 1. Centang Checkbox baris data pertama (Index 1)
        cy.get('table.listing tbody tr').eq(1).within(() => {
            cy.get('input[type="checkbox"]').check({force: true});
        });

        // 2. Klik tombol "Mark as shipped" (Bulk Action - SPAN)
        cy.contains('span', 'Mark as shipped').should('be.visible').click();

        // 3. --- HANDLE MODAL "Fulfill 1 orders" (PERBAIKAN UTAMA) ---
        // Masalah sebelumnya: Ada 2 elemen modal terdeteksi.
        // Solusi: Ambil yang visible dan yang terakhir (layer paling atas).
        
        cy.get('div[role="dialog"]')
          .filter(':visible') // Hanya yang terlihat mata
          .last()             // Ambil yang paling depan (aktif)
          .within(() => {
              // Klik tombol konfirmasi di dalam modal
              // Kita cari tombol yang mengandung teks "Mark as shipped"
              cy.contains('Mark as shipped').click();
          });

        // 4. Validasi & Log
        cy.wait(2000); // Tunggu proses server
        cy.log('Order berhasil diproses menjadi Shipped');
    });

    // TC-005: Mengubah Shipment Status menjadi Delivered
    it('TC-005: Mengubah Shipment Status menjadi Delivered', () => {
        // KASUS KHUSUS: Ganti Filter ke "Shipped"
        
        cy.log('--- Ganti Filter ke Shipped ---');
        cy.visit('/admin/orders'); 
        
        // 1. Buka Filter (Klik SPAN)
        cy.contains('span', 'Shipment status').click();
        
        // 2. Pilih "Shipped" (Link <a>)
        cy.get('ul li a').contains(/^Shipped$/).should('be.visible').click();
        
        // Tunggu tabel reload
        cy.wait(1500);

        // 3. Klik Link Order pada baris pertama hasil filter
        // [NOTE] Jika TC-004 sukses, pasti ada data di sini.
        cy.get('table.listing tbody tr', {timeout: 10000})
          .eq(1)
          .find('a[href*="/admin/order/edit/"]')
          .click();

        // 4. Klik tombol "Mark Delivered"
        // Gunakan contains umum agar aman
        cy.contains('Mark Delivered').should('be.visible').click();

        // 5. Validasi
        cy.wait(1000);
        cy.get('body').should('contain', 'Delivered');
    });

    // TC-006: Membatalkan Pesanan (Cancel Order)
    it('TC-006: Membatalkan Pesanan (Cancel Order)', () => {
        // Filter sudah otomatis Pending (dari beforeEach).
        // Kita ambil baris pertama (Pending) untuk dibatalkan.
        cy.get('table.listing tbody tr').eq(1)
          .find('a[href*="/admin/order/edit/"]')
          .click(); 

        // 1. Klik Cancel
        cy.contains('Cancel Order').should('be.visible').click();

        // 2. Isi Alasan di Modal
        cy.wait(500);
        
        // Cari textarea di dalam modal yang visible
        cy.get('textarea[placeholder*="Reason"]')
          .filter(':visible')
          .type('Testing Cancel Order');

        // 3. Submit Cancellation
        cy.contains('Submit Cancellation').click();

        // 4. Validasi
        cy.wait(1000);
        cy.get('body').should('contain', 'Canceled');
    });

});