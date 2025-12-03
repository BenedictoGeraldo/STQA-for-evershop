describe('Manajemen Penjualan - Melihat & Memfilter Pesanan (TC-001, TC-002, TC-013)', () => {

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
        // Pastikan tabel termuat (minimal header dan 1 baris data)
        // Menggunakan index > 1 karena baris pertama di Evershop sering kosong
        cy.get('table.listing tbody tr', {timeout: 10000}).should('have.length.gt', 1);
    });

    // TC-001: Melihat daftar pesanan masuk (Validasi Kolom Tabel)
    it('TC-001: Admin dapat melihat daftar pesanan dengan kolom lengkap', () => {
        // Validasi Header Tabel
        const expectedHeaders = [
            'Order Number', 
            'Date', 
            'Customer Email', 
            'Shipment Status', 
            'Payment Status', 
            'Total'
        ];

        // Loop untuk mengecek setiap header ada
        expectedHeaders.forEach(header => {
            cy.get('table.listing thead tr').should('contain', header);
        });

        // Validasi Data Tampil (Baris ke-2 / Index 1 harus ada)
        cy.get('table.listing tbody tr').eq(1).should('exist');
    });

    // TC-002: Melihat Detail Pesanan
    it('TC-002: Admin dapat melihat detail pesanan secara lengkap', () => {
        // Klik Link Order Number pada baris data pertama (Index 1)
        cy.get('table.listing tbody tr').eq(1)
          .find('a[href*="/admin/order/edit/"]')
          .click();

        // --- VALIDASI HALAMAN DETAIL ---
        
        // 1. Validasi URL dan Judul
        cy.url().should('include', '/admin/order/edit/');
        // Judul biasanya "Editing #100xx"
        cy.contains('h1', /Order #|Editing #/i).should('be.visible');

        // 2. Validasi Info Customer (Panel Samping)
        cy.contains('Customer').should('be.visible');       
        cy.contains('Shipping Address').should('be.visible'); 

        // 3. Validasi Daftar Barang (MENGGUNAKAN CLASS DARI HTML ANDA)
        // Cari tabel dengan class "order-items"
        cy.get('table.listing.order-items').should('be.visible');
        
        // Cari teks "SKU:" yang terlihat jelas di HTML
        cy.contains('span', 'SKU:').should('be.visible');

        // 4. Validasi Ringkasan Harga (Paid - Cash On Delivery Card)
        // Cari teks "Subtotal" dan "Total"
        cy.contains('div.summary-row', 'Subtotal').should('be.visible');
        cy.contains('div.summary-row', 'Total').should('be.visible');
        
        // 5. Validasi Activities (Optional, tapi bagus karena Anda kirim HTML-nya)
        cy.contains('Activities').should('be.visible');
    });

    // TC-013: Memfilter Daftar Pesanan Berdasarkan Shipment Status
    it('TC-013: Admin dapat memfilter pesanan berdasarkan Shipment Status', () => {
        // 1. Buka Filter Shipment Status
        // Menggunakan selector SPAN agar konsisten dengan file shipment
        cy.contains('span', 'Shipment status').click();

        // 2. Pilih Status "Pending" dari dropdown
        // Menggunakan selector UL LI A agar spesifik
        cy.get('ul li a').contains(/^Pending$/).should('be.visible').click();

        // 3. Validasi URL berubah (Query Param)
        cy.url().should('include', 'shipment_status=pending');

        // 4. Validasi Data di Tabel sesuai Filter
        cy.wait(1000); // Tunggu reload tabel
        
        // Ambil baris data pertama (Index 1), pastikan mengandung 'Pending'
        cy.get('table.listing tbody tr').eq(1).should('contain', 'Pending');
    });

});