describe('Admin | Catalog - Manage Products (TC-011 - TC-020)', () => {

    Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
    });
  
    // Hapus total blok 'before' yang berisi cy.session()

    beforeEach(() => {
        // 🚨 SOLUSI AKHIR: Lakukan HARD LOGIN sebelum setiap test
        // Ini menjamin sesi selalu baru dan valid.
        cy.visit('/admin/login'); 
        cy.get("input[name='email']").type('admin@email.com'); 
        cy.get("input[name='password']").type('123123123'); 
        cy.get("button[type='submit']").click();

        // 1. Verifikasi sudah di Dashboard
        cy.url().should('include', '/admin'); 
        cy.get('h1').contains('Dashboard').should('be.visible'); 
        
    });

    // TC-011 & WCAG-002: Verifikasi navigasi dan Usability (WCAG) halaman Products
    it('TC-011 & WCAG-002: Verifikasi navigasi dan Usability (WCAG) halaman Products', () => {
        
        // Klik submenu Products. Navigasi harus bekerja karena sesi baru
        cy.get('a[href="http://localhost:3000/admin/products"]')
          .should('be.visible')
          .click(); 
        
        // Verifikasi halaman Produk
        cy.url().should('include', '/admin/products');
        cy.get('h1').contains('Products').should('be.visible'); 

        cy.injectAxe()

        // ♿️ WCAG-002: PENGUJIAN USABILITY/ACCESSIBILITY
        cy.checkA11yWithLogging(null, {
            includedTags: ['wcag2a', 'wcag2aa'],
        });
        
        cy.log('🎉 Pemeriksaan WCAG Halaman Katalog (Products) Selesai.');
    });

// it('TC-012: verifikasi fungsionalitas search produk yang hasilnya ditemukan', () => {
//     cy.visit('/admin/products');

//     const searchInputSelector = 'input[placeholder="Search"]';
  
//    cy.get(searchInputSelector)
//      .last() 
//       .should('be.visible')
//       .type('Classic Leather Loafers{enter}'); 

//   });


//   it('TC-013: verifikasi fungsionalitas search produk yang hasilnya tidak ditemukan', () => {
//     cy.visit('/admin/products');

//     const searchInputSelector = 'input[placeholder="Search"]';
    
//     cy.get(searchInputSelector)
//       .last() 
//       .should('be.visible')
//       .type('abcdskk123{enter}'); 

//     cy.contains('There is no product to display', { timeout: 10000 }).should('be.visible');
//   });

// it('TC-014: verifikasi fungsionalitas filter produk (Filter by Status)', () => {
//   cy.visit('/admin/products');

//   // 1. Klik tombol custom dropdown "Status"
//   cy.contains('button', 'Status').click();

//   // 2. Klik link "Disabled"
//   cy.contains('a', 'Disabled').click();

//   // 3. Verifikasi URL
//   cy.url({ timeout: 10000 }).should('satisfy', (url) => {
//     return url.includes('status=disabled') || url.includes('status=0');
//   });

//   cy.contains('There is no product to display', { timeout: 10000 }).should('be.visible');
// });


// it('TC-015: verifikasi fungsionalitas Pagination', () => {
//   cy.log('--- Memulai TC-015 (FIX - URL Check) ---');
//   cy.visit('/admin/products');

//   let firstProductNameOnPage1;

//   const selectorNamaProdukPertama = 'table.listing.sticky tbody tr:nth-child(2) td:nth-child(3) a';

//   cy.get(selectorNamaProdukPertama, { timeout: 20000 })
//     .should('be.visible')
//     .invoke('text')
//     .then((text) => {
//       firstProductNameOnPage1 = text.trim();
//       cy.log(`Produk pertama di Halaman 1: ${firstProductNameOnPage1}`);
//       expect(firstProductNameOnPage1).to.not.be.empty;
//     });

//   cy.get('div.pagination .next a').click();

//   cy.url({ timeout: 10000 }).should('include', 'page=2');

//   cy.get(selectorNamaProdukPertama, { timeout: 20000 })
//     .should('be.visible')
//     .invoke('text')
//     .then((textOnPage2) => {
//       cy.log(`Produk pertama di Halaman 2: ${textOnPage2.trim()}`);
//       expect(textOnPage2.trim()).to.not.equal(firstProductNameOnPage1);
//     });
// });


//   // it('TC-016: Verifikasi fungsionalitas tambah produk baru (happy path)', () => {
//   //   cy.visit('/admin/products');

//   //   cy.contains('New Product').click();

//   //   cy.url().should('include', '/admin/products/new');

//   //   const productName = `Cypress Product ${Date.now()}`;
//   //   const sku = `CYP-${Date.now()}`;

//   //   cy.get("input[name='name']").type(productName); 
//   //   cy.get("input[name='sku']").should('not.be.disabled').type(sku);
    
//   //   cy.get("input[name='qty']").type('100', { force: true });
//   //   cy.get("input[name='price']").type('99.99', { force: true });
//   //   cy.get("input[name='weight']").type('1.5', { force: true }); 

//   //   cy.get('input[name="description"]', { timeout: 10000 })
//   //     .type('Ini deskripsi produk tes.', { force: true }) 
//   //     .trigger('change', { force: true }); 

    
//   //   cy.get('input[name="url_key"]', { timeout: 10000 })
//   //     .type(sku, { force: true }); 

//   //   cy.get('input[name="meta_title"]', { timeout: 10000 })
//   //     .type(productName, { force: true });

//   //   cy.get('textarea[name="meta_description"]', { timeout: 10000 })
//   //     .type('Ini meta deskripsi produk tes.', { force: true });
//   //   cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();

//   //   cy.url({ timeout: 10000 }).should('not.include', '/new');

//   //   cy.url().should('include', '/admin/products');
//   //   cy.contains(productName, { timeout: 10000 }).should('be.visible');
//   // });

//     it('TC-017: Verifikasi fungsionalitas tambah produk baru dengan field kosong', () => {
//     // Kunjungi halaman daftar produk
//     cy.visit('/admin/products');

//     cy.contains('New Product').click();

//     cy.url().should('include', '/admin/products/new');


//     cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();


//     cy.url().should('include', '/admin/products');
//   });

//     it('TC-018: Verifikasi fungsionalitas tambah produk baru dengan harga minus (-)', () => {
//     // Kunjungi halaman daftar produk
//     cy.visit('/admin/products');

//     cy.contains('New Product').click();

//     cy.url().should('include', '/admin/products/new');

//     const productName = `Cypress Product ${Date.now()}`;
//     const sku = `CYP-${Date.now()}`;

//     cy.get("input[name='name']").type(productName); 
//     cy.get("input[name='sku']").should('not.be.disabled').type(sku);
    
//     cy.get("input[name='qty']").type('100', { force: true });
//     cy.get("input[name='price']").type('-99.99', { force: true });
//     cy.get("input[name='weight']").type('1.5', { force: true }); 

//     cy.get('input[name="description"]', { timeout: 10000 })
//       .type('Ini deskripsi produk tes.', { force: true }) 
//       .trigger('change', { force: true }); 

    
//     cy.get('input[name="url_key"]', { timeout: 10000 })
//       .type(sku, { force: true }); 

//     cy.get('input[name="meta_title"]', { timeout: 10000 })
//       .type(productName, { force: true });

//     cy.get('textarea[name="meta_description"]', { timeout: 10000 })
//       .type('Ini meta deskripsi produk tes.', { force: true });
//     cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();


//     cy.url().should('include', '/admin/products');
//   });

// it('TC-019: Verifikasi fungsionalitas update data produk (dengan Rollback)', () => {
    
//     // Handler untuk mengabaikan error aplikasi yang muncul saat page load/search
//     cy.on('uncaught:exception', (err, runnable) => {
//         if (err.message.includes('Something wrong. Please try again')) {
//             cy.log('CYPRESS: Mengabaikan error aplikasi yang tidak fatal.');
//             return false;
//         }
//         return true;
//     });

//     const originalName = 'Floral Maxi Dress'; 
//     const updatedName = 'floral maxi'; 
//     const originalUrlKey = 'floral-maxi-dress'; // Asumsikan URL Key asli, harusnya bisa diambil dari form
//     const updatedUrlKey = 'floral-maxi'; 
//     const searchInputSelector = 'input[placeholder="Search"]';
//     let values = {}; // Untuk menyimpan semua nilai form yang ada

//     cy.log('--- Memulai TC-019: Update Produk ---');
//     cy.visit('/admin/products'); 

//     // --- BAGIAN 1: UPDATE PRODUK (NAMA ASLI -> NAMA BARU) ---
    
//     // 1. CARI PRODUK MENGGUNAKAN SEARCH (Workaround untuk menghindari navigasi statis)
//     // Walaupun ada bug POST 404, request GET (yang memuat ulang halaman) seharusnya berhasil
//     cy.log(`Mencari produk: ${originalName}`);
//     cy.get(searchInputSelector, { timeout: 10000 })
//       .first()
//       .should('be.visible')
//       .clear()
//       .type(originalName + '{enter}'); 
      
//     // 2. Klik produk
//     cy.log(`Mengklik link produk: ${originalName}`);
//     // Tunggu produk muncul setelah pencarian dan klik
//     cy.contains('a', originalName, { timeout: 10000 }).click(); // 👈 Baris ini sekarang seharusnya bekerja
    
//     // 3. Verifikasi masuk halaman edit
//     cy.url({ timeout: 10000 }).should('include', '/admin/products/edit/');

//     // 4. BACA SEMUA NILAI KRITIS SECARA ASYNCHRONOUS
//     cy.get("input[name='price']").invoke('val').then(val => { values.price = val; })
//       .then(() => cy.get("input[name='sku']").invoke('val')).then(val => { values.sku = val; })
//       .then(() => cy.get("input[name='qty']").invoke('val')).then(val => { values.qty = val; })
//       .then(() => cy.get("input[name='weight']").invoke('val')).then(val => { values.weight = val; })
//       .then(() => cy.get('input[name="description"]').invoke('val')).then(val => { values.description = val; })
//       .then(() => cy.get('input[name="meta_title"]').invoke('val')).then(val => { values.meta_title = val; })
//       .then(() => cy.get('textarea[name="meta_description"]').invoke('val')).then(val => { values.meta_description = val; })
//       .then(() => cy.get("input[name='url_key']").invoke('val')).then(val => { values.originalUrlKey = val; }) // 👈 Simpan URL Key Asli
//       .then(() => {
//         // --- START FORM FILLING ---
        
//         // 5. Ganti nama DAN URL KEY ke nilai sementara
//         cy.log(`Mengganti nama menjadi: ${updatedName} dan URL Key: ${updatedUrlKey}`);
//         cy.get("input[name='name']").clear().type(updatedName);
//         cy.get("input[name='url_key']").clear().type(updatedUrlKey); 

//         // 6. TULIS ULANG SEMUA NILAI WAJIB yang tidak diubah
//         cy.log('Menulis ulang nilai wajib yang tersimpan...');
//         const typeOptions = { force: true, parseSpecialCharSequences: false }; 
        
//         cy.get("input[name='price']").type('{selectall}{del}', {force: true}).type(values.price, {force: true}); 
//         cy.get("input[name='sku']").type('{selectall}{del}', {force: true}).type(values.sku, {force: true}); 
//         cy.get("input[name='qty']").type('{selectall}{del}', {force: true}).type(values.qty, {force: true}); 
//         cy.get("input[name='weight']").type('{selectall}{del}', {force: true}).type(values.weight, {force: true}); 
//         cy.get('input[name="description"]').type('{selectall}{del}', typeOptions).type(values.description, typeOptions);
//         cy.get('input[name="meta_title"]').type('{selectall}{del}', typeOptions).type(values.meta_title, typeOptions);
//         cy.get('textarea[name="meta_description"]').type('{selectall}{del}', typeOptions).type(values.meta_description, typeOptions); 

//         // 7. Klik save
//         cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();

//         // 8. Verifikasi update berhasil (WORKAROUND BUG REDIRECT)
//         cy.url({ timeout: 10000 }).then((currentUrl) => {
//             if (currentUrl.includes('/edit')) {
//                 cy.log('BUG APLIKASI TERDETEKSI: GAGAL REDIRECT. MELANJUTKAN DENGAN NAVIGASI MANUAL.');
//                 cy.visit('/admin/products'); 
//                 expect(true).to.be.true; 
//             } else {
//                 cy.url().should('include', '/admin/products');
//             }
//         });
        
//         cy.log('Update pertama berhasil diverifikasi di halaman daftar.');

//         // 9. Verifikasi nama BARU di daftar produk
//         cy.get(searchInputSelector)
//           .first() // 👈 Tambahkan di sini juga
//           .clear()
//           .type(`${updatedName}{enter}`); 
//         cy.contains('a', updatedName, { timeout: 10000 }).should('be.visible');


//         // --- BAGIAN 2: ROLLBACK PRODUK (NAMA BARU -> NAMA ASLI) ---

//         cy.log('--- Memulai Rollback: Mengembalikan Nama Produk ---');
        
//         // 10. Klik produk dengan nama BARU
//         cy.contains('a', updatedName, { timeout: 10000 }).click(); 

//         // 11. Ganti nama DAN URL KEY kembali ke nilai ASLI
//         cy.log(`Mengganti nama kembali ke: ${originalName} dan URL Key: ${values.originalUrlKey}`);
//         cy.get("input[name='name']").clear().type(originalName);
//         cy.get("input[name='url_key']").clear().type(values.originalUrlKey); 

//         // 12. TULIS ULANG SEMUA NILAI WAJIB (sekali lagi untuk memastikan data lain tidak hilang)
//         cy.log('Menulis ulang nilai wajib yang tersimpan...');
//         cy.get("input[name='price']").type('{selectall}{del}', {force: true}).type(values.price, {force: true}); 
//         cy.get("input[name='sku']").type('{selectall}{del}', {force: true}).type(values.sku, {force: true}); 
//         cy.get("input[name='qty']").type('{selectall}{del}', {force: true}).type(values.qty, {force: true}); 
//         cy.get("input[name='weight']").type('{selectall}{del}', {force: true}).type(values.weight, {force: true}); 
//         cy.get('input[name="description"]').type('{selectall}{del}', typeOptions).type(values.description, typeOptions);
//         cy.get('input[name="meta_title"]').type('{selectall}{del}', typeOptions).type(values.meta_title, typeOptions);
//         cy.get('textarea[name="meta_description"]').type('{selectall}{del}', typeOptions).type(values.meta_description, typeOptions); 

//         // 13. Klik save
//         cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();

//         // 14. Verifikasi update kedua berhasil (WORKAROUND BUG REDIRECT)
//         cy.url({ timeout: 10000 }).then((currentUrl) => {
//             if (currentUrl.includes('/edit')) {
//                 cy.log('BUG APLIKASI TERDETEKSI: GAGAL REDIRECT. MELANJUTKAN DENGAN NAVIGASI MANUAL.');
//                 cy.visit('/admin/products'); 
//             } else {
//                 cy.url().should('include', '/admin/products');
//             }
//         });
        
//         cy.log('Rollback berhasil diverifikasi di halaman daftar.');

//         // 15. Verifikasi nama ASLI di daftar produk
//         cy.get(searchInputSelector)
//           .first() // 👈 Tambahkan di sini juga
//           .clear()
//           .type(`${originalName}{enter}`);
//         cy.contains('a', originalName, { timeout: 10000 }).should('be.visible');
        
//         cy.log('--- TC-019 SELESAI. Data Berhasil Dikembalikan ---');
//     });
// });

// it('TC-020: Verifikasi fungsionalitas hapus produk (FIX - Tanpa Search)', () => {
    
//     // --- Handler tetap diperlukan untuk potensi crash lain ---
//     cy.on('uncaught:exception', (err, runnable) => {
//       if (err.message.includes('Something wrong. Please try again')) {
//         cy.log('CYPRESS: Mengabaikan error aplikasi yang tidak fatal.');
//         return false;
//       }
//       return true;
//     });

//     const productNameToDelete = 'Cypress Product 1763903206856';

//     cy.log(`--- Memulai TC-020: Menghapus produk ${productNameToDelete} ---`);
//     // 1. Kunjungi halaman produk (Asumsi produk ada di Page 1)
//     cy.visit('/admin/products'); 

//     // 2. Klik ikon/tombol "Delete" di baris produk yang ditemukan
//     cy.log(`Mencari dan menghapus produk: ${productNameToDelete}`);
    
//     cy.contains('a', productNameToDelete, { timeout: 10000 })
//       .parents('tr') // Naik ke baris (row) produk
//       .find('a,button') // Cari tombol di dalam baris itu
//       .last() 
//       .click();

//     cy.on('window:confirm', (str) => {
//       cy.log(`Mengkonfirmasi penghapusan: ${str}`);
//       expect(str).to.include('Are you sure'); 
//       return true
//     });

//     cy.contains('a', productNameToDelete, { timeout: 10000 }).should('not.exist');

//     cy.log('--- TC-020: Penghapusan produk berhasil diverifikasi ---');
//   });
});