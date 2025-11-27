describe('Admin - Manajemen Koleksi Katalog', () => {

    const ADMIN_EMAIL = 'admin@email.com'; 
    const ADMIN_PASSWORD = '123123123'; 
    
    // ... (beforeEach: Hard Login ke Dashboard) ...
    beforeEach(() => {
        // Hard Login untuk stabilitas
        cy.visit('/admin/login');
        cy.get("input[name='email']").type(ADMIN_EMAIL); 
        cy.get("input[name='password']").type(ADMIN_PASSWORD); 
        cy.get("button[type='submit']").click();
        
        // Verifikasi Dashboard dimuat
        cy.url().should('include', '/admin');
        cy.contains('h1', 'Dashboard').should('be.visible'); 
    });

    // ------------------------------------------------------------------

    // TC-033 & WCAG-004: Memastikan admin dapat mengakses halaman Koleksi Katalog dan menguji Usability
    it('TC-033 & WCAG-004: Verifikasi akses dan Usability (WCAG) halaman Collections', () => {
        
        // 1. Navigasi ke Collections
        cy.contains('a', 'Collections') 
            .should('be.visible')
            .click(); 
        
        // 2. Verifikasi Halaman
        cy.contains('h1', 'Collections').should('be.visible');
        cy.url().should('include', '/admin/collections');
        cy.get('table').should('be.visible'); 
        cy.contains('a', 'New Collection').should('be.visible');

        // 3. ♿️ WCAG-004: PENGUJIAN USABILITY/ACCESSIBILITY
        
        // Inject Axe-core ke halaman Collections yang baru dimuat
        cy.injectAxe(); 
        
        // Jalankan check A11y (WCAG AA) dengan logging kustom
        cy.checkA11yWithLogging(null, {
            includedTags: ['wcag2a', 'wcag2aa'],
            rules: {
                // Aturan yang krusial untuk halaman berdata (tabel)
                'td-headers-attr': { enabled: true }, 
                'color-contrast': { enabled: true },
                'select-name': { enabled: true } // Fokus pada Select/Pagination
            }
        });
        
        cy.log('🎉 Pemeriksaan WCAG Halaman Collections Selesai.');
    });
    
    // ------------------------------------------------------------------

    /**
     * TC-034: Membuat Koleksi Baru (Perbaikan Fokus Navigasi)
     */
//    it('TC-034: Should successfully create a new collection with valid data', () => {
        
//     // --- DEFINISI DATA PENGUJIAN ---
//     const timestamp = Cypress._.random(1000, 9999);
//     const collectionName = `Produk Pilihan Hari Ini ${timestamp}`;
//     const uniqueId = `pilihanhariini${timestamp}`; 
//     const descriptionText = 'Deskripsi koleksi baru yang dibuat melalui pengujian otomatis Cypress.';

//     // --------------------------------------------------------
//     // --- PERBAIKAN NAVIGASI ---
    
//     // Langkah 1A: Navigasi dari Dashboard ke Halaman Koleksi
//     cy.log('Langkah 1A: Navigasi ke Halaman Collections');
//     cy.contains('a', 'Collections') 
//         .should('be.visible')
//         .click(); 
    
//     // Verifikasi berada di halaman Collections
//     cy.contains('h1', 'Collections').should('be.visible');
    
//     // Langkah 1B: Navigasi dari Halaman Koleksi ke Halaman "Create a new collection"
//     cy.log('Langkah 1B: Klik tombol New Collection');
//     cy.contains('a', 'New Collection')
//         .should('be.visible') 
//         .click();
    
//     // --- VERIFIKASI SEBELUM INPUT ---
//     cy.log('Verifikasi Halaman Siap');
//     cy.get('h1.page-heading-title').should('contain', 'Create a new collection').and('be.visible'); 
    
//     // --------------------------------------------------------
//     // --- TEST STEPS ---

// // Step 1: Input Name
//     cy.log('Step 2: Input Collection Name');
//     cy.get('#name') 
//         .should('be.visible')
//         .clear()
//         .type(collectionName)
//         .should('have.value', collectionName);

//     // Step 2: Input Unique ID
//     cy.log('Step 3: Input Unique ID');
//     cy.get('#code') 
//         .should('be.visible')
//         .clear()
//         .type(uniqueId)
//         .should('have.value', uniqueId);

//     // ----------------------------------------------------------------------
//     // Step 3 (BARU): Klik Template Layout untuk mengaktifkan editor
//     cy.log('Step 3.A: Click the first layout template to activate the editor');
//     cy.get('.row-templates')
//         .should('be.visible')
//         .find('a:first') // Menargetkan link template pertama
//         .click(); 
//     // ----------------------------------------------------------------------

//     // Step 4: Input Description (Sekarang editor seharusnya sudah aktif)
//     cy.log('Step 3.B: Input Description into the active editor');
    
//     // Kita akan mencari elemen <p> yang merupakan area input setelah template diklik
//     // Elemen ini harus sudah muncul di DOM dan terlihat
// cy.get('#rows') 
//     .should('exist') 
//     .and('be.visible')
//     .click() 
//     // GANTI find('p') dengan find('[contenteditable="true"]')
//     .find('[contenteditable="true"]')        
//     .clear()
//     .type(descriptionText);
        
//     // Step 5: Klik tombol Save
//     cy.log('Step 5: Click the Save button');
//     cy.get('button.primary')
//         .contains('Save')
//         .click();

//     // --------------------------------------------------------
//     // --- EXPECTED RESULTS ---
    
//     cy.log('Langkah 6: Navigasi kembali ke Halaman Collections');
//         cy.contains('a', 'Collections') 
//             .should('be.visible')
//             .click(); 
        
//         // Expected Result 1: Verifikasi berada di halaman Collections
//         cy.log('Expected Result 7: Verifikasi berada di halaman Collections');
//         cy.contains('h1', 'Collections').should('be.visible');

//         // Expected Result 2: Verifikasi data ada di tabel (Verifikasi sukses yang sebenarnya)
//         cy.log('Expected Result 8: Verifikasi data ada di tabel');
//         // Cari nama koleksi yang baru dibuat di dalam tabel.
//         cy.contains('table', collectionName).should('be.visible');
//     });

    // it('TC-035: Should successfully update the name of an existing collection', () => {
        
    //     // --- DEFINISI DATA PENGUJIAN ---
    //     const timestamp = Cypress._.random(1000, 9999);
    //     const oldCollectionName = 'Featured Products';
    //     const newCollectionName = `Pilihan Unggulan Diperbarui ${timestamp}`;
    //     // --------------------------------------------------------

    //     // Langkah 1: Navigasi ke Halaman Collections
    //     cy.log('Langkah 1: Navigasi ke Halaman Collections');
    //     cy.contains('a', 'Collections') 
    //         .should('be.visible')
    //         .click(); 
        
    //     // Verifikasi berada di halaman Collections
    //     cy.contains('h1', 'Collections').should('be.visible');

    //     // Langkah 2: Temukan Koleksi "Featured Products" dan Klik untuk Edit
    //     cy.log(`Langkah 2: Mencari dan mengklik koleksi "${oldCollectionName}" untuk edit`);
        
    //     // Asumsi: Nama koleksi di tabel adalah link yang mengarahkan ke halaman edit.
    //     cy.contains('table td', oldCollectionName)
    //         .should('be.visible')
    //         .click();
            
    //     // Verifikasi navigasi ke halaman Edit
    //     cy.url().should('include', '/edit'); 
    //     cy.get('h1.page-heading-title').should('contain', 'Editing').and('be.visible'); 

    //     // Langkah 3: Update Nama Koleksi
    //     cy.log('Langkah 3: Mengganti Nama Koleksi');
    //     cy.get('#name') 
    //         .should('have.value', oldCollectionName) // Verifikasi nama lama ada sebelum diganti
    //         .clear()
    //         .type(newCollectionName)
    //         .should('have.value', newCollectionName);

    //     // Langkah 4: Klik tombol Save
    //     cy.log('Langkah 4: Klik tombol Save');
    //     cy.get('button.primary')
    //         .contains('Save')
    //         .click();

    //     // --------------------------------------------------------
    //     // --- EXPECTED RESULTS ---

    //     // Expected Result 1: Verifikasi navigasi (ke halaman edit atau list, kita verifikasi success message dulu)
        
    //     // Catatan: Karena kita tidak mengandalkan Toastify, kita akan langsung navigasi kembali
    //     // untuk memverifikasi data, seperti solusi TC-034 sebelumnya.
        
    //     // Langkah 5: Navigasi kembali ke Halaman Daftar Collections
    //     cy.log('Langkah 5: Navigasi kembali ke Halaman Collections');
    //     cy.contains('a', 'Collections') 
    //         .should('be.visible')
    //         .click(); 

    //     // Expected Result 2: Verifikasi nama koleksi baru ada di tabel
    //     cy.log('Expected Result 6: Verifikasi nama baru ada di tabel');
    //     cy.contains('table', newCollectionName).should('be.visible');
        
    //     // Opsional: Verifikasi nama lama sudah tidak ada
    //     // (Ini akan sukses asalkan nama barunya tidak mengandung string nama lama, misal: 'Featured Products')
    //     cy.log('Expected Result 7 (Opsional): Verifikasi nama lama tidak ada');
    //     cy.contains('table', oldCollectionName).should('not.exist');
    // });
    

//     it('TC-036: Should successfully add products to an existing collection', () => {
        
//         // --- DEFINISI DATA PENGUJIAN ---
//         const collectionName = 'Produk Pilihan Hari Ini 9364';
//         // Nama produk BARU yang akan dicari dan ditambahkan
//         const productToAdd = 'Cypress Product 1763199993675'; 
//         const productCode = 'CYP-1763199993675';
//         // --------------------------------------------------------

//         // ... (Langkah 1 & 2: Navigasi ke halaman Edit Koleksi 'Produk Pilihan Hari Ini 9364') ...
        
//         // Langkah 1: Navigasi ke Halaman Collections
//         cy.log('Langkah 1: Navigasi ke Halaman Collections');
//         cy.contains('a', 'Collections').click(); 
        
//         // Langkah 2: Temukan Koleksi Target dan Klik untuk Edit
//         cy.log(`Langkah 2: Mencari dan mengklik koleksi "${collectionName}" untuk edit`);
//         cy.contains('table td', collectionName).click();
            
//         // Verifikasi navigasi ke halaman Edit
//         cy.url().should('include', '/edit'); 
        
//         // --------------------------------------------------------
//         // --- PROSES MENAMBAHKAN PRODUK ---

//         // Langkah 3: Klik tombol 'Add products'
//         cy.log('Langkah 3: Klik tombol "Add products"');
//         cy.contains('a.text-interactive', 'Add products') 
//             .should('be.visible')
//             .click(); 
            
//         // Langkah 4: Cari Produk di dalam dialog/modal (FIX MULTIPLE ELEMENT ERROR)
//         cy.log(`Langkah 4: Mencari produk: ${productToAdd}`);
        
//         // Asumsi: Modal memiliki judul "Select Products", kita akan cari input di dalam modal tersebut
//         cy.contains('h1, h2, div', 'Select Products') 
//             .parents('.modal, .popup') 
//             .find('input[placeholder="Search products"]') 
//             .should('be.visible')
//             // Tambahkan .last() dan {force: true} untuk mengatasi error Visibility/Multiple Element saat mengetik
//             .last() 
//             .type(productToAdd, { force: true });

//         // Tunggu sebentar agar hasil pencarian muncul
//         cy.wait(500); 

//         // Langkah 5: Pilih Produk yang diinginkan
//         cy.log(`Langkah 5: Memilih produk "${productToAdd}"`);
//         // Cari baris yang mengandung nama produk dan klik checkbox di baris tersebut
//         // Kita menggunakan kode produk (SKU) karena lebih unik daripada nama
//         cy.contains(productCode, { timeout: 8000 }) // Cari teks Kode Produk di mana pun dalam 8 detik
//             .parents('.grid') // Naik ke elemen grid yang merupakan kontainer baris
//             .find('button.secondary') // Cari tombol Select menggunakan class 'secondary'
//             .contains('Select') // Pastikan itu tombol 'Select'
//             .click(); // Ganti .check() dengan .click()

//         // Langkah 6: Tutup pop-up pemilihan produk
//         cy.log('Langkah 6: Menutup pop-up pemilihan produk (Click Close)');
//         // Berdasarkan screenshot, tombol penutup berada di modal.
//         cy.get('button[aria-label="close"], button.close, button:contains("Close")')
//             .should('be.visible')
//             .click(); 

//         // Langkah 7: Klik tombol Save utama koleksi
//         cy.log('Langkah 7: Klik tombol Save utama koleksi');
//         cy.get('button.primary')
//             .contains('Save')
//             .click();

//         // --------------------------------------------------------
//         // --- EXPECTED RESULTS ---
        
//         // Expected Result 1: Verifikasi pesan sukses (Kita coba lagi, selektor tetap sama)
//         cy.log('Expected Result 8: Verifikasi pesan sukses');
//         cy.get('.Toastify__toast-body') 
//              .should('be.visible')
//              .and('contain', 'saved successfully'); 

//         // Expected Result 2: Verifikasi produk muncul di list koleksi
//         cy.log('Expected Result 9: Verifikasi produk muncul di list');
//         // Verifikasi kode produk muncul di area tampilan produk di halaman edit koleksi
//         cy.get('.card-section') // Targetkan area yang menampilkan produk
//             .should('contain', productToAdd);
//     });

// it('TC-037: Should successfully remove a product from an existing collection', () => {
        
//         // --- DEFINISI DATA PENGUJIAN ---
//         const collectionName = 'Produk Pilihan Hari Ini 9364';
//         const productToAdd = 'Cypress Product 1763199993675'; // Nama produk
//         const productCode = 'CYP-1763199993675'; // Kode produk
//         // --------------------------------------------------------

//         // Langkah 1: Navigasi ke Halaman Collections
//         cy.log('Langkah 1: Navigasi ke Halaman Collections');
//         cy.contains('a', 'Collections') 
//             .should('be.visible')
//             .click(); 
        
//         // Langkah 2: Temukan Koleksi Target dan Klik untuk Edit
//         cy.log(`Langkah 2: Mencari dan mengklik koleksi "${collectionName}" untuk edit`);
//         cy.contains('table td', collectionName)
//             .should('be.visible')
//             .click();
            
//         // Verifikasi navigasi ke halaman Edit
//         cy.url().should('include', '/edit'); 
        
//         // --------------------------------------------------------
//         // --- PROSES MENGHAPUS PRODUK ---

//         // Langkah 3: Verifikasi produk yang akan dihapus sudah ada (Pre-condition)
//         cy.log(`Langkah 3: Memastikan produk "${productToAdd}" sudah ada`);
//         cy.contains('.card-section', productToAdd).should('be.visible');

//         // Langkah 4: Klik tombol 'Remove' di samping produk
//         cy.log(`Langkah 4: Klik tombol "Remove" untuk produk "${productToAdd}"`);
        
//         // Cari baris produk menggunakan nama, lalu cari link "Remove"
//         cy.contains('.grid', productToAdd) 
//             .contains('a', 'Remove') // Selektor berdasarkan HTML yang Anda berikan
//             .should('be.visible')
//             .click();
            
//         // Catatan: Setelah klik 'Remove', produk seharusnya hilang dari DOM/list *sebelum* disave.
//         cy.log('Verifikasi produk hilang dari list sementara');
//         cy.contains('.card-section', productCode).should('not.exist');


//         // Langkah 5: Klik tombol Save utama koleksi untuk menyimpan perubahan
//         cy.log('Langkah 5: Klik tombol Save utama koleksi');
//         cy.get('button.primary')
//             .contains('Save')
//             .click();

//         // --------------------------------------------------------
//         // --- EXPECTED RESULTS ---
        
//         // Expected Result 6: Verifikasi pesan sukses
//         cy.log('Expected Result 6: Verifikasi pesan sukses');
//         cy.get('.Toastify__toast-body, .alert-success') 
//              .should('be.visible')
//              .and('contain', 'saved successfully', { timeout: 6000 }); 

//         // Expected Result 7: Verifikasi produk sudah tidak ada di list koleksi (Final Verification)
//         cy.log('Expected Result 7: Verifikasi produk sudah tidak ada di list');
//         // Verifikasi kode produk TIDAK muncul di area tampilan produk di halaman edit koleksi
//         cy.get('.card-section') 
//             .should('not.contain', productCode);
//     });

// it('TC-038: Should successfully delete a collection that contains products', () => {
        
//         // --- DEFINISI DATA PENGUJIAN ---
//         const collectionName = 'Produk Pilihan Hari Ini 6275'; 
//         // --------------------------------------------------------

//         // Langkah 1: Navigasi ke Halaman Collections
//         cy.log('Langkah 1: Navigasi ke Halaman Collections');
//         cy.contains('a', 'Collections') 
//             .should('be.visible')
//             .click(); 
        
//         // Verifikasi berada di halaman Collections
//         cy.contains('h1', 'Collections').should('be.visible');

//         // --------------------------------------------------------
//         // --- PROSES MENGHAPUS KOLEKSI ---

//         // Langkah 2: Cari koleksi target dan centang checkbox-nya
//         cy.log(`Langkah 2: Mencari koleksi "${collectionName}" dan mencentang checkbox`);
//         cy.contains('tr', collectionName) 
//             .should('be.visible')
//             .find('input[type="checkbox"]') // Cari checkbox di baris tersebut
//             .check({ force: true }); 

//         // Langkah 3: Klik tombol Delete yang muncul di daftar
//         cy.log('Langkah 3: Klik tombol Delete yang muncul di daftar');
//         cy.contains('button, a', 'Delete')
//             .should('be.visible') 
//             .click();

//         // Langkah 4: Konfirmasi Penghapusan di Modal/Pop-up
//         cy.log('Langkah 4: Konfirmasi penghapusan di modal');
//         // Mencari tombol konfirmasi 'Confirm', 'Yes', atau 'Delete' di modal
//         cy.contains('button', /Confirm|Yes|Delete/i) 
//             .should('be.visible')
//             .click();
        
//         // Verifikasi navigasi kembali ke halaman list (terjadi otomatis setelah delete)
//         cy.contains('h1', 'Collections').should('be.visible');

//         // --------------------------------------------------------
//         // --- EXPECTED RESULTS (FOKUS PADA HASIL AKHIR) ---
        
//         // Expected Result 5: Verifikasi koleksi sudah hilang dari tabel
//         cy.log('Expected Result 5: Verifikasi koleksi TIDAK ada di daftar');
//         // KARENA TOAST GAGAL, KITA HANYA MENGANDALKAN VERIFIKASI INI
//         cy.contains('table', collectionName).should('not.exist');
//     });

    // it('TC-039: Should successfully create a new collection with valid data (duplicate name)', () => {
        
    //     // --- DEFINISI DATA PENGUJIAN (DIPERBAIKI) ---
    //     // Nama ini akan diduplikasi di setiap run
    //     const duplicateCollectionName = `Produk Pilihan Hari Ini 4549`; 
        
    //     // ID ini harus selalu unik agar sistem mengizinkan pembuatan koleksi baru
    //     const uniqueTimestamp = Cypress._.random(1000, 9999);
    //     const uniqueId = `duplikat-id-${uniqueTimestamp}`; 
        
    //     const descriptionText = 'Deskripsi koleksi duplikat yang dibuat melalui pengujian otomatis Cypress.';

    //     // --------------------------------------------------------
    //     // --- PERBAIKAN NAVIGASI ---
        
    //     // Langkah 1A: Navigasi dari Dashboard ke Halaman Koleksi
    //     cy.log('Langkah 1A: Navigasi ke Halaman Collections');
    //     cy.contains('a', 'Collections') 
    //         .should('be.visible')
    //         .click(); 
        
    //     // Verifikasi berada di halaman Collections
    //     cy.contains('h1', 'Collections').should('be.visible');
        
    //     // Langkah 1B: Navigasi dari Halaman Koleksi ke Halaman "Create a new collection"
    //     cy.log('Langkah 1B: Klik tombol New Collection');
    //     cy.contains('a', 'New Collection')
    //         .should('be.visible') 
    //         .click();
        
    //     // --- VERIFIKASI SEBELUM INPUT ---
    //     cy.log('Verifikasi Halaman Siap');
    //     cy.get('h1.page-heading-title').should('contain', 'Create a new collection').and('be.visible'); 
        
    //     // --------------------------------------------------------
    //     // --- TEST STEPS ---

    //     // Step 1: Input Name (MENGGUNAKAN NAMA DUPLIKAT YANG SAMA)
    //     cy.log('Step 2: Input Collection Name (Duplicate)');
    //     cy.get('#name') 
    //         .should('be.visible')
    //         .clear()
    //         .type(duplicateCollectionName) // Menggunakan nama yang sama setiap run
    //         .should('have.value', duplicateCollectionName);

    //     // Step 2: Input Unique ID (MENGGUNAKAN ID UNIK)
    //     cy.log('Step 3: Input Unique ID (Unique)');
    //     cy.get('#code') 
    //         .should('be.visible')
    //         .clear()
    //         .type(uniqueId) // Menggunakan ID yang berbeda setiap run
    //         .should('have.value', uniqueId);

    //     // ----------------------------------------------------------------------
    //     // Step 3 (BARU): Klik Template Layout untuk mengaktifkan editor
    //     cy.log('Step 3.A: Click the first layout template to activate the editor');
    //     cy.get('.row-templates')
    //         .should('be.visible')
    //         .find('a:first') 
    //         .click(); 
    //     // ----------------------------------------------------------------------

    //     // Step 4: Input Description (Menggunakan perbaikan yang sudah teruji)
    //     cy.log('Step 3.B: Input Description into the active editor');
    //     cy.get('#rows') 
    //         .should('exist') 
    //         .and('be.visible')
    //         .click() // Klik untuk memastikan fokus
    //         .find('[contenteditable="true"], p') // Targetkan elemen input yang benar
    //         .clear()
    //         .type(descriptionText);
                
    //     // Step 5: Klik tombol Save
    //     cy.log('Step 5: Click the Save button');
    //     cy.get('button.primary')
    //         .contains('Save')
    //         .click();

    //     // --------------------------------------------------------
    //     // --- EXPECTED RESULTS ---
        
    //     // Langkah 6: Navigasi kembali ke Halaman Collections
    //     cy.log('Langkah 6: Navigasi kembali ke Halaman Collections');
    //     cy.contains('a', 'Collections') 
    //         .should('be.visible')
    //         .click(); 
            
    //     // Expected Result 1: Verifikasi berada di halaman Collections
    //     cy.log('Expected Result 7: Verifikasi berada di halaman Collections');
    //     cy.contains('h1', 'Collections').should('be.visible');

    //     // Expected Result 2: Verifikasi data ada di tabel (Verifikasi sukses yang sebenarnya)
    //     cy.log('Expected Result 8: Verifikasi data ada di tabel');
    //     // Cari nama koleksi yang baru dibuat di dalam tabel.
    //     // Sekarang, tabel seharusnya menampilkan LEBIH DARI SATU koleksi dengan nama ini
    //     cy.contains('table', duplicateCollectionName).should('be.visible');
    // });

// it('TC-040: Should successfully delete a product from the main Products menu and verify its removal from a collection', () => {
        
//         // --- DEFINISI DATA PENGUJIAN ---
//         const collectionName = 'Featured Products'; 
//         const productName = 'Cypress Product 1763199993675'; // Nama produk untuk pencarian
//         const productCode = 'CYP-1763199993675'; // Kode produk (untuk verifikasi)
//         // --------------------------------------------------------

//         // --------------------------------------------------------
//         // --- PHASE 1: DELETE PRODUCT DARI MENU UTAMA ---

//         // Langkah 1: Navigasi ke Halaman Products
//         cy.log('Langkah 1: Navigasi ke Halaman Products');
//         cy.contains('a', 'Products') 
//             .should('be.visible')
//             .click(); 
//         cy.contains('h1', 'Products').should('be.visible');

//         // Langkah 2: Cari Produk menggunakan ID Search Bawah (MENGGUNAKAN NAMA + ENTER)
//         cy.log(`Langkah 2: Mencari produk menggunakan ID "keyword": "${productName}" dan menekan Enter`);
        
//         // Targetkan input dengan ID unik: #keyword
//         cy.get('#keyword') 
//             .should('be.visible')
//             .clear()
//             // Menggunakan productName dan menambahkan {enter}
//             .type(productName + '{enter}'); 

//         cy.wait(1500); // Tunggu hasil pencarian dimuat

//         // Langkah 3: Temukan Produk dan Centang Checkbox-nya
//         cy.log('Langkah 3: Mencentang checkbox produk');
        
//         // Cari baris tabel (<tr>) yang mengandung kode produk (hasil search)
//         // Kita cari baris menggunakan kode produk karena seringkali lebih unik di hasil tabel
//         cy.contains('tr, .product-item', productCode, { timeout: 6000 })
//             .should('be.visible')
//             .find('input[type="checkbox"]')
//             .check({ force: true }); // Centang checkbox

//         // Langkah 4: Klik tombol Delete yang muncul di header tabel
//         cy.log('Langkah 4: Klik tombol Delete');
//         cy.contains('button, a', 'Delete')
//             .should('be.visible')
//             .click();

//         // Langkah 5: Konfirmasi Penghapusan di Modal/Pop-up
//         cy.log('Langkah 5: Konfirmasi penghapusan di modal');
//         // Mencari tombol konfirmasi 'Confirm', 'Yes', atau 'Delete'
//         cy.contains('button', /Confirm|Yes|Delete/i) 
//             .should('be.visible')
//             .click();

//         // --------------------------------------------------------
//         // --- PHASE 2: VERIFIKASI DAMPAK PENGHAPUSAN DI KOLEKSI ---

//         // Langkah 6: Verifikasi Produk Hilang dari Daftar Produk Utama
//         cy.log('Langkah 6: Verifikasi produk hilang dari daftar produk utama');
//         cy.contains('table', productCode).should('not.exist');

//         // Langkah 7: Navigasi ke Halaman Collections
//         cy.log('Langkah 7: Navigasi ke Halaman Collections');
//         cy.contains('a', 'Collections')
//             .should('be.visible')
//             .click(); 
//         cy.contains('h1', 'Collections').should('be.visible');

//         // Langkah 8: Masuk ke Halaman Edit Koleksi Target
//         cy.log(`Langkah 8: Masuk ke halaman edit koleksi "${collectionName}"`);
//         cy.contains('table td', collectionName).click();
//         cy.url().should('include', '/edit'); 
        
//         // Langkah 9: Verifikasi Produk Hilang dari Koleksi (Expected Result)
//         cy.log('Langkah 9: Verifikasi produk hilang dari koleksi');
//         cy.get('.card-section') 
//             .should('not.contain', productCode); 
//     });
});