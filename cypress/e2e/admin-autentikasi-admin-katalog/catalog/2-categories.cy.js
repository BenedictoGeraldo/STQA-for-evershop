// cypress/e2e/catalog/categories.cy.js

describe('Admin | Catalog - Manage Categories (TC-021 - TC-030)', () => {

    const ADMIN_EMAIL = 'admin@email.com';
    const ADMIN_PASSWORD = '123123123'; 

// Di dalam file categories.cy.js Anda, ganti fungsi createCategory:
// Ganti fungsi createCategory di file categories.cy.js Anda
const createCategory = (name, parentName = '') => {
    cy.visit('/admin/categories');
    // Klik tombol New Category
    cy.contains('a', 'New Category').click(); 

    // URL KEY dibuat dari nama dan diubah menjadi format slug (lowercase, ganti spasi dengan -)
    const urlKey = name.toLowerCase().replace(/\s+/g, '-'); 
    const metaTitle = `Meta Title for ${name}`;
    const metaDescription = `Meta Description for ${name} category.`;

    // ===================================
    // 1. ISI FIELD WAJIB DI BAGIAN GENERAL
    // ===================================
    cy.log('Mengisi field Name...');
    cy.get("input[name='name']").type(name); 
    
    // Asumsi Description tidak wajib, tapi jika wajib bisa diisi di sini

    // Pilih Parent Category, JIKA parentName diberikan
    if (parentName) {
        cy.log(`Memilih Parent Category: ${parentName}`);
        
        // Klik link pemicu "Select category"
        cy.contains('a', 'Select category').click(); 
        
        // Tunggu ul.category-tree muncul dan klik link kategori
        cy.get('ul.category-tree').should('be.visible').within(() => {
            cy.contains('a', parentName).click();
        });
    }

    // =========================================
    // 2. ISI FIELD WAJIB DI BAGIAN SEO (4 KOLOM)
    // =========================================
    cy.log('Mengisi field SEO wajib...');
    cy.get("input[name='url_key']").type(urlKey); // Url key
    cy.get("input[name='meta_title']").type(metaTitle); // Meta title
    // Meta keywords (optional, tapi diisi untuk kelengkapan)
    cy.get("input[name='meta_keywords']").type(name.replace(/\s+/g, ', ')); 
    cy.get("textarea[name='meta_description']").type(metaDescription); // Meta description

    // =========================================
    // 3. SIMPAN
    // =========================================
    cy.contains('span', 'Save').parent('button').click();
    // Verifikasi sukses
    cy.contains('Category saved successfully!', { timeout: 10000 }).should('be.visible');
};
    
    /**
     * Login sekali sebelum semua tes di blok 'describe' ini.
     * Menggunakan cy.session() untuk menangani autentikasi.
     */
// Di dalam describe block Anda, GANTI beforeEach Anda dengan ini:
beforeEach(() => {
    // 1. Buat atau restore sesi login
    cy.session('adminLogin', () => {
        cy.visit('/admin/login');
        // Pastikan selector dan password benar
        cy.get("input[name='email']").type('admin@email.com'); 
        cy.get("input[name='password']").type('123123123'); // Gunakan password yang dikonfirmasi
        cy.get("button[type='submit']").click();
        
        // Verifikasi URL setelah login (Pastikan TIDAK kembali ke /login)
        cy.url().should('not.include', '/login'); 
        cy.url().should('include', '/admin'); 
    }, {
        // Tambahkan cacheAcrossSpecs: true jika Anda ingin sesi bertahan antar file spec
        cacheAcrossSpecs: true 
    });

    // 2. Kunjungi halaman utama Catalog (menu induk) SEBELUM SETIAP TES
    // Ini membantu mencegah masalah 'display: none'
    cy.visit('/admin'); // Coba langsung ke menu induk Catalog
});


    // ---
    
    // TC-021: Verifikasi akses halaman Daftar Kategori
    it('TC-021: Verifikasi akses halaman Daftar Kategori', () => {
        cy.visit('/admin'); // Mulai dari dashboard (dari beforeEach)
        
        // Klik sub menu Categories
        cy.contains('a', 'Categories').click(); 
        
        // Verifikasi
        cy.url().should('include', '/admin/categories');
        cy.contains('h1', 'Categories').should('be.visible'); // Cek judul halaman
        cy.get('table').should('be.visible'); // Menampilkan tabel/daftar
        cy.contains('a', 'New Category').should('be.visible'); // Tombol terlihat
    });

// // TC-022: Verifikasi pembuatan kategori induk baru
// it('TC-022: Verifikasi pembuatan kategori induk baru (Sport)', () => {
//     const newCategoryName = 'Sport';
    
//     // Data SEO/Mandatory Fields
//     const urlKey = newCategoryName.toLowerCase().replace(/\s+/g, '-');
//     const metaTitle = `Meta Title for ${newCategoryName}`;
//     const metaDescription = `Meta Description for ${newCategoryName} category.`;
    
//     cy.log(`--- Memulai TC-022: Membuat Kategori Induk ${newCategoryName} ---`);
//     cy.visit('/admin/categories'); // Navigasi ke halaman daftar

//     // 1. Klik New Category
//     cy.contains('a', 'New Category').click();
//     cy.url().should('include', '/admin/categories/new');

//     // ===================================
//     // 2. ISI FIELD WAJIB DI BAGIAN GENERAL
//     // ===================================
//     cy.log('Mengisi field Name dan Parent Category...');
//     cy.get("input[name='name']").type(newCategoryName);
    
//     // Parent Category dibiarkan default (ROOT) -> TIDAK ADA INTERAKSI
    
//     // =========================================
//     // 3. ISI FIELD WAJIB DI BAGIAN SEO
//     // =========================================
//     cy.log('Mengisi field SEO wajib...');
//     cy.get("input[name='url_key']").type(urlKey); // Url key
//     cy.get("input[name='meta_title']").type(metaTitle, { force: true }); // Meta title
//     cy.get("textarea[name='meta_description']").type(metaDescription, { force: true }); // Meta description

//     // =========================================
//     // 4. KLIK SAVE
//     // =========================================
//     cy.contains('span', 'Save').parent('button').click();

//     // =========================================
//     // 5. VERIFIKASI HASIL
//     // =========================================
    
//     // Expected Result a: Kategori berhasil disimpan (menggunakan teks sukses yang andal)
//     cy.contains('Category saved successfully!', { timeout: 10000 }).should('be.visible');

//     // Expected Result b: Verifikasi di halaman daftar
//     cy.visit('/admin/categories');
    
//     // Expected Result c: Kategori muncul di level teratas daftar
//     cy.contains('tr', newCategoryName).should('be.visible');
    
//     cy.log('--- TC-022 Selesai: Kategori Induk berhasil dibuat ---');
// });

// //Ganti TC-023 lama Anda dengan ini:
// it('TC-023: Verifikasi pembuatan sub kategori baru (Kemeja) di bawah Pakaian Pria', () => {
//     const subCategoryName = 'Kemeja';
//     const parentCategoryName = 'Men'; // Menggunakan Pakaian Pria (asumsi dari TC-022)
//     // Jika Anda ingin menggunakan 'Men', ganti 'Pakaian Pria' di baris ini

//     // Data SEO/Mandatory Fields
//     const urlKey = subCategoryName.toLowerCase().replace(/\s+/g, '-');
//     const metaTitle = `Meta Title for ${subCategoryName}`;
//     const metaDescription = `Meta Description for ${subCategoryName} category.`;
    
//     // 1. Kunjungi halaman New Category
//     cy.visit('/admin/categories'); // Pastikan ini adalah URI yang benar
//     cy.contains('a', 'New Category').click(); 
//     cy.url().should('include', '/admin/categories/new');

//     // ===================================
//     // 2. ISI FIELD WAJIB DI BAGIAN GENERAL
//     // ===================================
//     cy.log('Mengisi field Name dan Parent Category...');
//     cy.get("input[name='name']").type(subCategoryName);
    
//     // Pilih Parent Category: Pakaian Pria (Interaksi Category Tree)
//     cy.contains('a', 'Select category').click(); 

//     // Tunggu daftar kategori muncul dan lakukan seleksi
//     cy.get('ul.category-tree').should('be.visible').within(() => {
//         // Klik link parent yang diinginkan (Pakaian Pria)
//         cy.contains('a', parentCategoryName).click(); 
//     });

//     // =========================================
//     // 3. ISI FIELD WAJIB DI BAGIAN SEO
//     // =========================================
//     cy.log('Mengisi field SEO wajib...');
//     cy.get("input[name='url_key']").type(urlKey); // Url key
//     cy.get("input[name='meta_title']").type(metaTitle); // Meta title
//     cy.get("input[name='meta_keywords']").type(subCategoryName.replace(/\s+/g, ', ')); // Meta keywords
//     cy.get("textarea[name='meta_description']").type(metaDescription); // Meta description


//     // =========================================
//     // 4. KLIK SAVE
//     // =========================================
//     cy.contains('span', 'Save').parent('button').click();

//     // Expected Result: Kategori berhasil disimpan
//     cy.contains('Category saved successfully!', { timeout: 10000 }).should('be.visible');

//     // 5. Verifikasi di halaman daftar
//     cy.visit('/admin/categories');
//     // Verifikasi Kemeja muncul sebagai sub kategori di bawah Pakaian Pria
//     cy.contains('tr', parentCategoryName) 
//       .parents('table, div.tree-view-container') 
//       .contains('tr', subCategoryName) 
//       .should('be.visible');
// });

//     // TC-024: Verifikasi pembuatan kategori baru dengan field nama kosong
// it('TC-024: Verifikasi pembuatan kategori baru dengan field wajib kosong (Nama)', () => {
//     // Data untuk field wajib lain
//     const urlKey = 'temp-url-key-tco24';
//     const metaTitle = 'Temp Meta Title TCO24';
//     const metaDescription = 'Temp Meta Desc TCO24';

//     cy.log('--- Memulai TC-024: Uji Nama Kosong ---');
//     cy.visit('/admin/categories');

//     // 1. Klik New Category (Selector sudah dikoreksi)
//     cy.contains('a', 'New Category').click();
//     cy.url().should('include', '/admin/categories/new'); // Disesuaikan URI

//     // =========================================
//     // 2. ISI FIELD WAJIB LAINNYA (SEO)
//     // =========================================
//     cy.log('Mengisi field SEO wajib untuk isolasi error...');
//     cy.get("input[name='url_key']").type(urlKey); // Url key
//     cy.get("input[name='meta_title']").type(metaTitle, { force: true }); // Meta title
//     cy.get("textarea[name='meta_description']").type(metaDescription, { force: true }); // Meta description

//     // =========================================
//     // 3. SKENARIO UJI: KOSONGKAN NAMA
//     // =========================================
//     cy.get("input[name='name']").clear(); // Nama: (kosong)
    
//     // 4. Klik Save (Selector sudah dikoreksi)
//     cy.contains('span', 'Save').parent('button').click();

//     // =========================================
//     // EXPECTED RESULT
//     // =========================================
//     cy.url().should('include', '/admin/categories/new'); // Tetap di halaman new category 
    
//     // Pesan error muncul di bawah field nama (asumsi field Name adalah yang pertama gagal)
//     cy.get("input[name='name']")
//     .parent() // Naik ke parent (field-wrapper)
//     .parent() // Naik ke grand-parent (form-field-container)
//     .should('contain', 'This field can not be empty') // Cari teks error di dalam container
//     .and('be.visible');
        
//     cy.log('--- TC-024 Selesai: Verifikasi error validasi nama ---');
// });
    
    // TC-025: Verifikasi update kategori (mengubah nama)
// it('TC-025: Verifikasi update nama kategori (Kemeja -> Kemeja Pria)', () => {
//     const oldName = 'Kemeja Pria'; // Kategori ini diasumsikan ada dan sudah dibuat di 'before'
//     const newName = 'Kemeja';

//     // Data SEO yang Diperbarui
//     const newUrlKey = newName.toLowerCase().replace(/\s+/g, '-');
//     const newMetaTitle = `Updated Meta Title for ${newName}`;
//     const newMetaDescription = `Updated Meta Description for ${newName} category.`;
    
//     // --- 1. NAVIGASI KE HALAMAN EDIT ---
//     cy.visit('/admin/categories');
    
//     // Asumsi Selector Edit: Biasanya tombol/link di akhir baris. Kita cari row berdasarkan oldName.
//     cy.log(`Mencari dan mengklik Edit untuk kategori: ${oldName}`);
//     cy.contains('tr', oldName) 
//       .find('a[href*="/edit"], button[aria-label="Edit"]') // Selector umum untuk tombol edit
//       .first() // Ambil tombol/link edit pertama di baris itu
//       .click(); 

//     // --- 2. UPDATE FIELD NAME & WAJIB SEO ---
//     cy.url().should('include', '/admin/categories/edit');

//     // a. Ganti Nama
//     cy.log(`Mengubah nama dari ${oldName} menjadi ${newName}`);
//     cy.get("input[name='name']").clear().type(newName);

//     // b. Isi ulang/Update field SEO wajib untuk mencegah validasi error saat Save
//     cy.log('Mengisi ulang field SEO wajib...');
//     cy.get("input[name='url_key']").clear().type(newUrlKey); 
//     cy.get("input[name='meta_title']").clear().type(newMetaTitle, { force: true });
//     cy.get("textarea[name='meta_description']").clear().type(newMetaDescription, { force: true });
    
//     // --- 3. SIMPAN ---
//     cy.contains('span', 'Save').parent('button').click();

//     // --- 4. VERIFIKASI ---
    
//     // Expected Result a: Kategori berhasil disimpan (menggunakan teks sukses yang andal)
//     cy.contains('Category saved successfully!', { timeout: 10000 }).should('be.visible'); 
    
//     // Expected Result b: Verifikasi nama baru di daftar
//     cy.visit('/admin/categories');
//     cy.contains('tr', newName).should('be.visible');
    
//     // Expected Result c: Verifikasi nama lama hilang (jika Kemeja sudah diupdate menjadi Kemeja Pria)
//     cy.contains('tr', oldName).should('not.exist');
    
//     cy.log('--- TC-025 Selesai: Kategori berhasil diupdate ---');
// });

    // TC-026: Verifikasi update kategori untuk mengubah struktur (memindahkan parent)
// // TC-026: Verifikasi update struktur kategori (Kemeja -> Aksesoris)
// it('TC-026: Verifikasi update struktur kategori (Kemeja -> Aksesoris)', () => {
//     // Kategori 'Kemeja' diasumsikan sudah ada di bawah 'Men' (dari TC-023 yang disesuaikan)
//     const categoryToMove = 'Kemeja'; 
//     const newParent = 'Aksesoris'; 
//     const oldParent = 'Men'; // Asumsi parent lama adalah 'Men'

//     // Data SEO yang Diperbarui
//     const urlKey = categoryToMove.toLowerCase().replace(/\s+/g, '-');
//     const metaTitle = `Meta Title for ${categoryToMove}`;
//     const metaDescription = `Meta Description for ${categoryToMove} category.`;

//     cy.log(`--- Memulai TC-026: Memindahkan ${categoryToMove} ke bawah ${newParent} ---`);
    
//     // ===================================
//     // LANGKAH 0: PRECONDITION - BUAT PARENT BARU (AKSESORIS)
//     // ===================================
//     cy.log('PRECONDITION: Membuat kategori induk baru "Aksesoris"');
//     // Asumsi: createCategory adalah helper function yang sudah benar
//     createCategory(newParent); 
    
//     // Kembali ke daftar kategori untuk memulai proses update
//     cy.visit('/admin/categories'); 
    
//     // ===================================
//     // LANGKAH 1: NAVIGASI KE HALAMAN EDIT KEMEJA
//     // ===================================
//     // Klik Edit pada Kemeja
//     cy.contains('tr', categoryToMove) 
//       .find('a[href*="/edit"], button[aria-label="Edit"]') // Selector tombol edit
//       .first() 
//       .click(); 

//     cy.url().should('include', '/admin/categories/edit');

//     // ===================================
//     // LANGKAH 2: UBAH STRUKTUR (Parent Category)
//     // ===================================
//     cy.log(`Mengubah Parent Category dari ${oldParent} ke ${newParent}...`);
    
//     // a. Klik link pemicu "Select category"
//     cy.contains('a', 'Change').click(); 

//     // b. Tunggu daftar kategori muncul dan klik link parent baru
//     cy.get('ul.category-tree').should('be.visible').within(() => {
//         cy.contains('a', newParent).click(); // Klik Aksesoris
//     });
    
//     // ===================================
//     // LANGKAH 3: ISI ULANG FIELD WAJIB (SEO)
//     // ===================================
//     cy.log('Mengisi ulang field SEO wajib...');
//     cy.get("input[name='url_key']").clear().type(urlKey); 
//     cy.get("input[name='meta_title']").clear().type(metaTitle, { force: true });
//     cy.get("textarea[name='meta_description']").clear().type(metaDescription, { force: true });
    
//     // ===================================
//     // LANGKAH 4: KLIK SAVE
//     // ===================================
//     cy.contains('span', 'Save').parent('button').click();

//     // ===================================
//     // LANGKAH 5: VERIFIKASI
//     // ===================================
    
//     // Expected Result a: Kategori berhasil disimpan
//     cy.contains('Category saved successfully!', { timeout: 10000 }).should('be.visible'); 
    
//     // Expected Result b: Kunjungi halaman daftar kategori untuk verifikasi struktur
//     cy.visit('/admin/categories');
    
//     // Expected Result c: Verifikasi Kemeja sekarang muncul di bawah Aksesoris
//     cy.log(`Verifikasi ${categoryToMove} muncul di bawah ${newParent}`);
//     cy.contains('tr', newParent) 
//       .parents('table, div.tree-view-container') 
//       .contains('tr', categoryToMove) 
//       .should('be.visible');

// });

// // TC-027: Verifikasi hapus kategori (yang tidak memiliki produk)
// it('TC-027: Verifikasi hapus kategori (Kids) dan Re-create', () => {
//     const categoryToDelete = 'Kids';

//     cy.log(`--- Memulai TC-027: Menghapus ${categoryToDelete} via Bulk Action ---`);
//     cy.visit('/admin/categories');
    
//     // ===================================
//     // LANGKAH 1: SELEKSI KATEGORI
//     // ===================================
//     // Cari baris kategori "Kids" dan centang checkbox-nya
// cy.contains('tr', categoryToDelete) 
//   .find('input[type="checkbox"]')
//   .click({ force: true });
    
//     // ===================================
//     // LANGKAH 2: KLIK TOMBOL DELETE (Bulk Action)
//     // ===================================
//     cy.log('Mengklik tombol Delete dari Bulk Action...');
//     // Tombol Delete berada di div inline-flex di bawah <tr> utama
//     cy.get('div.inline-flex.border.border-divider.rounded') 
//       .contains('span', 'Delete')
//       .parents('a') // Naik ke elemen <a>
//       .click();
    
//     // 3. Klik confirm pada pop up konfirmasi
//     cy.on('window:confirm', (str) => {
//          cy.log(`Konfirmasi penghapusan: ${str}`);
//          return true; // Mengklik OK/Confirm
//     }); 

    
//     // Expected Result b: Verifikasi kategori hilang dari daftar
//     cy.contains('tr', categoryToDelete).should('not.exist');
    
//     cy.log('--- TC-027: Kategori berhasil dihapus ---');

//     // ===================================
//     // LANGKAH 5: RE-CREATE KATEGORI KIDS
//     // ===================================
//     cy.log('--- LANGKAH RE-CREATE: Membuat kembali kategori Kids ---');
//     // Asumsi createCategory adalah helper function yang sudah benar dan mengisi field wajib
//     createCategory(categoryToDelete); 

//     cy.log('--- TC-027 Selesai: Kids berhasil dihapus dan dibuat ulang ---');
// });


// // TC-028: Verifikasi hapus kategori yang memiliki produk di dalamnya (Men)
// it('TC-028: Verifikasi hapus kategori yang memiliki produk di dalamnya (Men)', () => {
//     const categoryWithProducts = 'Men'; 
    
//     // --- WORKAROUND UNTUK CRASH 500 ---
//     // Mencegah Cypress gagal total karena unhandled exception (Axios Error 500)
//     cy.on('uncaught:exception', (err, runnable) => {
//         if (err.message.includes('500') || err.message.includes('AxiosError')) {
//             cy.log('CYPRESS: Mengabaikan Uncaught Exception (500 Error) yang dihasilkan aplikasi.');
//             return false; 
//         }
//         return true;
//     });
//     // ----------------------------------

//     cy.log(`--- Memulai TC-028: Uji Gagal Hapus ${categoryWithProducts} (Tanpa Toast) ---`);
//     cy.visit('/admin/categories');

//     // ===================================
//     // LANGKAH 1: SELEKSI KATEGORI SPESIFIK ("Men")
//     // ===================================
//     cy.log('Mencari link "Men" dan mencentang checkbox...');
//     cy.contains('a', categoryWithProducts) 
//       .parents('tr') 
//       .find('td')    
//       .first()      
//       .find('input[type="checkbox"]')
//       .click({ force: true }); 


//     // ===================================
//     // LANGKAH 2: KLIK TOMBOL DELETE (Bulk Action)
//     // ===================================
//     cy.log('Mengklik tombol Delete dari Bulk Action...');
//     cy.contains('button, a', 'Delete').click(); 

//     // ===================================
//     // LANGKAH 3: TANGANI MODAL KONFIRMASI KUSTOM
//     // ===================================
//     cy.log('Menanggapi modal konfirmasi custom (Klik Delete)...');
//     cy.contains('button', 'Delete').click(); 

//     // ===================================
//     // LANGKAH 4: VERIFIKASI KEGAGALAN (Kategori Masih Ada)
//     // ===================================
    
//     // Karena tidak ada toast, verifikasi utama adalah keberadaan kategori setelah aksi
//     cy.log('Verifikasi: Kategori TIDAK terhapus.');

//     // Expected Result a: Kategori masih ada di daftar (VERIFIKASI INI PALING UTAMA)
//     cy.contains('tr', categoryWithProducts).should('be.visible');
    
//     // Optional: Verifikasi pesan error di console/log
//     // Anda dapat menambahkan custom command untuk memverifikasi request DELETE (misal status 500)
    
//     cy.log('--- TC-028 Selesai: Kategori Men berhasil dipertahankan ---');
// });

 // TC-029: Verifikasi penanganan error saat membuat kategori dengan nama duplikat
// it('TC-029: Verifikasi pembuatan kategori induk baru duplikat (Men)', () => {
//     const newCategoryName = 'Men';
    
//     // Data SEO/Mandatory Fields
//     const urlKey = newCategoryName.toLowerCase().replace(/\s+/g, '-');
//     const metaTitle = `Meta Title for ${newCategoryName}`;
//     const metaDescription = `Meta Description for ${newCategoryName} category.`;
    
//     cy.visit('/admin/categories'); // Navigasi ke halaman daftar

//     // 1. Klik New Category
//     cy.contains('a', 'New Category').click();
//     cy.url().should('include', '/admin/categories/new');

//     // ===================================
//     // 2. ISI FIELD WAJIB DI BAGIAN GENERAL
//     // ===================================
//     cy.log('Mengisi field Name dan Parent Category...');
//     cy.get("input[name='name']").type(newCategoryName);
    
//     // Parent Category dibiarkan default (ROOT) -> TIDAK ADA INTERAKSI
    
//     // =========================================
//     // 3. ISI FIELD WAJIB DI BAGIAN SEO
//     // =========================================
//     cy.log('Mengisi field SEO wajib...');
//     cy.get("input[name='url_key']").type(urlKey); // Url key
//     cy.get("input[name='meta_title']").type(metaTitle, { force: true }); // Meta title
//     cy.get("textarea[name='meta_description']").type(metaDescription, { force: true }); // Meta description

//     // =========================================
//     // 4. KLIK SAVE
//     // =========================================
//     cy.contains('span', 'Save').parent('button').click();

//     // =========================================
//     // 5. VERIFIKASI HASIL
//     // =========================================
    
//     // Expected Result a: Kategori berhasil disimpan (menggunakan teks sukses yang andal)
//     cy.contains('Category saved successfully!', { timeout: 10000 }).should('be.visible');

//     // Expected Result b: Verifikasi di halaman daftar
//     cy.visit('/admin/categories');
    
//     // Expected Result c: Kategori muncul di level teratas daftar
//     cy.contains('tr', newCategoryName).should('be.visible');
    
// });

// // TC-030: Verifikasi keamanan input (XSS) pada field nama kategori
// it('TC-030: Verifikasi keamanan input (XSS) pada field nama kategori', () => {
//     // Payload mentah yang dimasukkan (input)
//     const rawPayload = '<script>alert("XSS")</script>'; 
//     // Payload yang DIHARAPKAN TERSIMPAN di UI setelah di-encode (output aman)
//     const encodedPayload = '&lt;script&gt;alert("XSS")&lt;/script&gt;'; 
    
//     // Data SEO unik yang harus diisi agar Save berhasil
//     const categoryName = `XSS Test ${Date.now()}`;
//     const uniqueUrlKey = categoryName.toLowerCase().replace(/\s+/g, '-') + '-xss';
//     const metaTitle = `Meta Title for XSS Test`;
//     const metaDescription = `XSS security test.`;
    
//     // Gunakan cy.on untuk menangkap dan mengabaikan alert() jika XSS berhasil dieksekusi (Lulus Tes)
//     cy.on('window:alert', (str) => {
//         cy.log(`SUCCESSFUL XSS EXECUTION DETECTED (INI BUG): ${str}`);
//         return false; // Mencegah popup menghentikan test
//     });

//     cy.log('--- Memulai TC-030: Uji XSS pada field Nama ---');
//     cy.visit('/admin/categories'); 

//     // 1. Navigasi ke New Category (Selector sudah dikoreksi)
//     cy.contains('a', 'New Category').click();
//     cy.url().should('include', '/admin/categories/new');

//     // ===================================
//     // 2. INPUT PAYLOAD XSS dan MANDATORY FIELDS
//     // ===================================
//     cy.log('Mengisi Name dengan Payload XSS dan field wajib lainnya...');
    
//     // Input payload XSS ke field Name
//     cy.get("input[name='name']").type(rawPayload);
    
//     // Isi field wajib lainnya (SEO)
//     cy.get("input[name='url_key']").type(uniqueUrlKey); 
//     cy.get("input[name='meta_title']").type(metaTitle, { force: true }); 
//     cy.get("textarea[name='meta_description']").type(metaDescription, { force: true }); 

//     // 3. KLIK SAVE
//     cy.contains('span', 'Save').parent('button').click();

//     // =========================================
//     // 4. VERIFIKASI KEAMANAN
//     // =========================================
    
//     // Expected Result a: Kategori berhasil disimpan
//     cy.visit('/admin/categories');
    
//     // Expected Result b: Verifikasi output (TIDAK ADA EKSEKUSI SCRIPT)
//     cy.log('Verifikasi: Payload XSS tersimpan sebagai HTML Encoded Text...');

//     // Kita cari baris yang mengandung payload yang SUDAH DI-ENCODE
//     cy.contains('tr', encodedPayload) 
//       .should('exist'); // Memastikan baris dengan payload ter-encode ditemukan
      
//     // Final Assertion: Memastikan teks yang tersimpan benar-benar teks, bukan HTML
//     cy.contains('tr', encodedPayload) 
//       .find('td')
//       .invoke('text')
//       .should('include', encodedPayload);

//     cy.log('--- TC-030 Selesai: Input XSS LULUS UJI SANITASI (Output Encoding) ---');
// });
});