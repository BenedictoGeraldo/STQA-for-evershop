describe('Admin - Manajemen Katalog', () => {

    const ADMIN_EMAIL = 'admin@email.com'; 
    const ADMIN_PASSWORD = 'alferli04'; 
    const ATTRIBUTES_URL = '/admin/attributes';

    // BeforeEach: Login ke Dashboard
beforeEach(() => {
        cy.visit('/admin/login');
        
        // Memastikan field email tidak disabled sebelum mengetik
        cy.get("input[name='email']")
            .should('not.be.disabled') 
            .type(ADMIN_EMAIL); 
        
        // Memastikan field password tidak disabled sebelum mengetik (Solusi untuk Error Anda)
        cy.get("input[name='password']")
            .should('not.be.disabled') // Tunggu hingga elemen tidak disabled
            .type(ADMIN_PASSWORD); 
            
        cy.get("button[type='submit']").click();
        cy.url().should('include', '/admin');
        cy.contains('h1', 'Dashboard').should('be.visible'); 
    });

    // --- TEST CASE TC-045 ---
    it('TC-045: Verifikasi Akses Halaman Atribut (Katalog)', () => {
        // 1. Aksi: Navigasi langsung ke URL Atribut
        cy.visit(ATTRIBUTES_URL);

        // 2. Verifikasi: URL sudah sesuai
        cy.url().should('include', ATTRIBUTES_URL);

        // 3. Verifikasi: Judul halaman terlihat
        // Asumsi: Judul halaman adalah "Attributes" atau "Daftar Atribut"
        // Kita akan cek judul 'Attributes' atau 'Daftar Atribut' sebagai judul utama
        cy.contains('h1', /Attributes/i) // Mencari h1 yang mengandung teks 'attributes' atau 'daftar atribut' (case insensitive)
          .should('be.visible');

        // 4. Verifikasi: Tombol utama 'Tambah Atribut Baru' terlihat
        // Asumsi: Tombol untuk menambah atribut memiliki teks 'New Attribute' atau 'Tambah Atribut Baru'
        cy.contains('a', /New Attribute/i)
          .should('be.visible');
    });


    // it('TC-046: Verifikasi Pembuatan Grup Atribut Baru dengan Valid', () => {
    //         // ... (Variabel spesifik TC-046) ...
    //         const UNIQUE_ID = Cypress._.random(0, 1e6);
    //         const NEW_ATTRIBUTE_NAME = 'Warna_TC46_' + UNIQUE_ID; 
    //         const ATTRIBUTE_CODE = 'warna_tc46_' + UNIQUE_ID; 
    //         const SORT_ORDER = '10';
            
    //         // 1. Precondition: Akses Halaman Daftar Atribut
    //         cy.visit(ATTRIBUTES_URL);
    //         cy.contains('h1', /Attributes|Daftar Atribut/i).should('be.visible');

    //         // 2. Aksi: Klik tombol 'New Attribute'
    //         cy.contains('a', /New Attribute|Tambah Atribut Baru/i).click();

    //         // 3. Verifikasi: Berada di halaman form pembuatan atribut
    //         cy.url().should('include', '/admin/attributes/new');

    //         // 4. Aksi: Isi Semua Field Wajib
    //         cy.log('Mengisi Nama, Code Atribut dan Sort Order');
    //         cy.get('input[name="attribute_name"]').should('be.visible').type(NEW_ATTRIBUTE_NAME);
    //         cy.get('input[name="attribute_code"]').should('be.visible').type(ATTRIBUTE_CODE);
    //         cy.get('input[name="sort_order"]').should('be.visible').type(SORT_ORDER);

    //         // 5. Aksi: Pilih Type 'Select' (Perbaikan Error 'not visible')
    //         cy.log('Memilih Tipe: Select dengan mengklik label');
    //         // Mengklik label yang berisi teks 'Select'
    //         cy.contains('label', 'Select').click(); 
            
    //         // Tambahan verifikasi: Pastikan input radio 'Select' sekarang checked
    //         cy.get('#type1').should('be.checked'); 

    //         // 6. Aksi: Klik tombol 'Save'
    //         cy.contains('button', /Save|Simpan/i).click(); 

    //         // 7. Verifikasi: Muncul Pesan Sukses
    //         cy.contains(/success|berhasil/i).should('be.visible');
            
    //         cy.visit(ATTRIBUTES_URL);
            
    //     });


// it('TC-047: Verifikasi Penambahan Opsi (Merah & Biru) ke Atribut "Warna_TC46_30533"', () => {
//         // Variabel hanya di sini
//         const TARGET_ATTRIBUTE_NAME = 'Warna_TC46_30533'; 
//         const OPTION_MERAH = 'Merah'; 
//         const OPTION_BIRU = 'Biru'; 
        
//         // 1. Aksi: Akses Halaman Edit Atribut
//         cy.visit(ATTRIBUTES_URL);
//         cy.contains('a', TARGET_ATTRIBUTE_NAME).click(); 
        
//         // 2. Verifikasi: Berada di halaman edit
//         cy.url().should('include', '/admin/attributes/edit');
//         cy.contains('h3', /Attribute options|Pilihan Atribut/i).should('be.visible');


//         // --- Tambah Opsi Pertama (Merah) ---
//         cy.log(`Menambahkan Opsi: ${OPTION_MERAH}`);
        
//         // 3. Aksi: Klik 'Add option'
//         // Mencari link "Add option" di bawah h3 "Attribute options"
//         cy.contains('h3', /Attribute options|Pilihan Atribut/i)
//             .parents('.card-section')
//             .contains('a', /Add option|Tambah opsi/i) 
//             .click(); 
        
//         // 4. Aksi: Isi nama opsi 'Merah'
//         // Selector input baru untuk opsi (menggunakan name attribute dan nilai yang belum diisi)
//         cy.get('input[name*="options["][value=""]') 
//             .should('be.visible')
//             .last() // Jika ada input kosong lain, ambil yang terakhir (yang baru muncul)
//             .type(OPTION_MERAH); 

//         // --- Tambah Opsi Kedua (Biru) ---
//         cy.log(`Menambahkan Opsi: ${OPTION_BIRU}`);
        
//         // 5. Aksi: Klik 'Add option' lagi
//         cy.contains('h3', /Attribute options|Pilihan Atribut/i)
//             .parents('.card-section')
//             .contains('a', /Add option|Tambah opsi/i) 
//             .click(); 
        
//         // 6. Aksi: Isi nama opsi 'Biru'
//         // Mencari input kosong yang terakhir muncul
//         cy.get('input[name*="options["][value=""]') 
//             .should('be.visible')
//             .last() 
//             .type(OPTION_BIRU);
        
//         // 7. Aksi: Klik tombol Save utama (untuk menyimpan kedua opsi sekaligus)
//         cy.contains('button.primary', 'Save').click();
        
//         // 8. Verifikasi: Muncul Pesan Sukses
//         cy.contains(/success|berhasil/i).should('be.visible');

//         // 9. Verifikasi Final: Kedua opsi ada di form setelah save dan refresh
//         cy.url().should('include', '/admin/attributes/edit');
        
//         // Verifikasi Merah ada
//         cy.get('input[name*="option_text"][value="Merah"]').should('exist');
        
//         // Verifikasi Biru ada
//         cy.get('input[name*="option_text"][value="Biru"]').should('exist');
//     });


    // it('TC-048: Verifikasi Update Opsi Atribut (Merah menjadi Merah Marun)', () => {
    //     // Variabel spesifik TC-048
    //     const TARGET_ATTRIBUTE_NAME = 'Warna_TC46_30533'; 
    //     const OPTION_LAMA = 'Merah'; 
    //     const OPTION_BARU = 'Merah Marun'; 
        
    //     // 1. Aksi: Akses Halaman Edit Atribut
    //     cy.visit(ATTRIBUTES_URL);
    //     cy.contains('a', TARGET_ATTRIBUTE_NAME).click(); 
        
    //     // 2. Verifikasi: Berada di halaman edit
    //     cy.url().should('include', '/admin/attributes/edit');
    //     cy.contains('h3', /Attribute options|Pilihan Atribut/i).should('be.visible');

    //     // 3. Aksi: Cari input field yang berisi nilai 'Merah' di area opsi
    //     // Menggunakan filter untuk mencari input berdasarkan nilai yang sedang ditampilkan (current JS value)
    //     cy.get('input[name*="option_text"]')
    //         .filter((index, el) => {
    //             // Mencari input yang nilainya sama dengan OPTION_LAMA ("Merah")
    //             return Cypress.$(el).val() === OPTION_LAMA;
    //         })
    //         .should('be.visible')
    //         .clear()
    //         .type(OPTION_BARU); 
        
    //     // 4. Aksi: Klik tombol Save utama untuk menyimpan perubahan atribut
    //     cy.contains('button.primary', 'Save').click();
        
    //     // 5. Verifikasi: Muncul Pesan Sukses
    //     cy.contains(/success|berhasil/i).should('be.visible');
        
    //     // 6. Verifikasi: Halaman refresh atau tetap di halaman edit
    //     cy.url().should('include', '/admin/attributes/edit'); 
        
    //     // 7. Verifikasi Final: Nama opsi baru muncul, nama opsi lama hilang
        
    //     // Cek kembali menggunakan filter untuk nilai baru ("Merah Marun")
    //     cy.get('input[name*="option_text"]')
    //         .filter((index, el) => {
    //             return Cypress.$(el).val() === OPTION_BARU;
    //         })
    //         .should('exist'); // Memastikan input dengan nilai baru ada

    //     // Cek bahwa input dengan nilai lama ("Merah") sudah tidak ada
    //     cy.get('input[name*="option_text"]')
    //         .filter((index, el) => {
    //             return Cypress.$(el).val() === OPTION_LAMA;
    //         })
    //         .should('not.exist');
    // });


    // it('TC-049: Verifikasi Delete Opsi Atribut (Menghapus Merah Marun)', () => {
    //     // Variabel spesifik TC-049
    //     const TARGET_ATTRIBUTE_NAME = 'Warna_TC46_30533'; 
    //     const OPTION_TO_DELETE = 'Merah Marun'; // Hasil dari TC-048
    //     const OPTION_TO_REMAIN = 'Biru'; // Opsi yang harus tetap ada (dari TC-047)
        
    //     // 1. Aksi: Akses Halaman Edit Atribut
    //     cy.visit(ATTRIBUTES_URL);
    //     cy.contains('a', TARGET_ATTRIBUTE_NAME).click(); 
        
    //     // 2. Verifikasi: Berada di halaman edit
    //     cy.url().should('include', '/admin/attributes/edit');
    //     cy.contains('h3', /Attribute options|Pilihan Atribut/i).should('be.visible');

    //     // 3. Aksi: Cari opsi 'Merah Marun' dan klik link 'Remove option' di barisnya
        
    //     // A. Cari input field opsi 'Merah Marun' berdasarkan nilai JavaScript-nya
    //     cy.get('input[name*="option_text"]')
    //         .filter((index, el) => {
    //             // Mencari input yang nilainya sama dengan OPTION_TO_DELETE ("Merah Marun")
    //             return Cypress.$(el).val() === OPTION_TO_DELETE;
    //         })
    //         .should('exist') // Pastikan opsi yang dicari ada
    //         .parents('.flex.mb-2.space-x-8') // Naik ke div baris opsi
    //         // B. Cari link Remove option di dalam baris itu dan klik
    //         .find('a.text-critical:contains("Remove option")')
    //         .click(); 
        
    //     // 4. Verifikasi (Visual): Opsi 'Merah Marun' hilang dari DOM sebelum disimpan
    //     // Menggunakan selector yang mencari input yang memiliki nilai tersebut
    //     cy.get(`input[name*="option_text"][value="${OPTION_TO_DELETE}"]`).should('not.exist');
        
    //     // 5. Verifikasi (Visual): Opsi 'Biru' harus tetap ada
    //     cy.get('input[name*="option_text"]')
    //         .filter((index, el) => {
    //             return Cypress.$(el).val() === OPTION_TO_REMAIN;
    //         })
    //         .should('exist');
        
    //     // 6. Aksi: Klik tombol Save utama untuk menyimpan penghapusan
    //     cy.contains('button.primary', 'Save').click();
        
    //     // 7. Verifikasi: Muncul Pesan Sukses
    //     cy.contains(/success|berhasil/i).should('be.visible');
        
    //     // 8. Verifikasi Akhir: Pastikan Merah Marun benar-benar hilang setelah halaman refresh
    //     cy.visit(ATTRIBUTES_URL);
    //     cy.contains('a', TARGET_ATTRIBUTE_NAME).click();
        
    //     cy.get('input[name*="option_text"]')
    //         .filter((index, el) => {
    //             return Cypress.$(el).val() === OPTION_TO_DELETE;
    //         })
    //         .should('not.exist'); // 'Merah Marun' tidak boleh ada

    //     cy.get('input[name*="option_text"]')
    //         .filter((index, el) => {
    //             return Cypress.$(el).val() === OPTION_TO_REMAIN;
    //         })
    //         .should('exist'); // 'Biru' harus ada
    // });

//     it('TC-050: Verifikasi Delete Grup Atribut yang Sudah Memiliki Opsi (via Checkbox)', () => {
//         // Variabel spesifik TC-050
//         const TARGET_ATTRIBUTE_NAME = 'Warna_TC46_760518'; 
        
//         // 1. Aksi: Akses Halaman Daftar Atribut
//         cy.visit(ATTRIBUTES_URL);
        
//         // 2. Verifikasi Precondition: Pastikan atribut yang akan dihapus ada
//         cy.get('table').contains('td', TARGET_ATTRIBUTE_NAME).should('exist');

// // 3. Aksi: Cari baris atribut dan klik label checkbox di dalamnya
//         cy.get('table')
//             .contains('tr', TARGET_ATTRIBUTE_NAME) // Cari baris yang mengandung nama atribut
//             .find('label') // Cari label yang membungkus checkbox
//             .click(); // Klik label untuk mencentang checkbox
        
//         // Verifikasi: Pastikan checkbox benar-benar tercentang (opsional, untuk debugging)
//         cy.get('table')
//             .contains('tr', TARGET_ATTRIBUTE_NAME)
//             .find('input[type="checkbox"]')
//             .should('be.checked');
//         // 4. Aksi: Klik tombol 'Delete' yang muncul di toolbar/header tabel
//         cy.contains('a', /Delete|Hapus/i)
//             .should('be.visible') 
//             .click(); 
//         // 5. Aksi: Konfirmasi pada Pop-up/Modal Konfirmasi
//         cy.contains('button', /delete|Ya|OK/i).click();
        
        
//         // 7. Verifikasi Akhir: Grup Atribut hilang dari daftar
//         cy.get('table').should('not.contain', TARGET_ATTRIBUTE_NAME);
//     });

// it('TC-051: Verifikasi Pembuatan Grup Atribut Baru dengan Valid (duplikat', () => {
            
//             const UNIQUE_ID = Cypress._.random(0, 1e6);
//             const NEW_ATTRIBUTE_NAME = 'Warna_TC46_30533'; 
//             const ATTRIBUTE_CODE = 'warna_tc46_' + UNIQUE_ID; 
//             const SORT_ORDER = '10';
            
//             // 1. Precondition: Akses Halaman Daftar Atribut
//             cy.visit(ATTRIBUTES_URL);
//             cy.contains('h1', /Attributes|Daftar Atribut/i).should('be.visible');

//             // 2. Aksi: Klik tombol 'New Attribute'
//             cy.contains('a', /New Attribute|Tambah Atribut Baru/i).click();

//             // 3. Verifikasi: Berada di halaman form pembuatan atribut
//             cy.url().should('include', '/admin/attributes/new');

//             // 4. Aksi: Isi Semua Field Wajib
//             cy.log('Mengisi Nama, Code Atribut dan Sort Order');
//             cy.get('input[name="attribute_name"]').should('be.visible').type(NEW_ATTRIBUTE_NAME);
//             cy.get('input[name="attribute_code"]').should('be.visible').type(ATTRIBUTE_CODE);
//             cy.get('input[name="sort_order"]').should('be.visible').type(SORT_ORDER);

//             // 5. Aksi: Pilih Type 'Select' (Perbaikan Error 'not visible')
//             cy.log('Memilih Tipe: Select dengan mengklik label');
//             // Mengklik label yang berisi teks 'Select'
//             cy.contains('label', 'Select').click(); 
            
//             // Tambahan verifikasi: Pastikan input radio 'Select' sekarang checked
//             cy.get('#type1').should('be.checked'); 

//             // 6. Aksi: Klik tombol 'Save'
//             cy.contains('button', /Save|Simpan/i).click(); 

//             // 7. Verifikasi: Muncul Pesan Sukses
//             cy.contains(/success|berhasil/i).should('be.visible');
            
//             cy.visit(ATTRIBUTES_URL);
            
//         });


    // it('TC-052: Verifikasi Penambahan Opsi (Biru & Biru) ke Atribut "Warna_TC46_30533 (duplikat)"', () => {
    //     // Variabel hanya di sini
    //     const TARGET_ATTRIBUTE_NAME = 'Warna_TC46_795658'; 
    //     const OPTION_B1RU = 'Biru'; 
    //     const OPTION_BIRU = 'Biru'; 
        
    //     // 1. Aksi: Akses Halaman Edit Atribut
    //     cy.visit(ATTRIBUTES_URL);
    //     cy.contains('a', TARGET_ATTRIBUTE_NAME).click(); 
        
    //     // 2. Verifikasi: Berada di halaman edit
    //     cy.url().should('include', '/admin/attributes/edit');
    //     cy.contains('h3', /Attribute options|Pilihan Atribut/i).should('be.visible');


    //     // --- Tambah Opsi Pertama (Merah) ---
    //     cy.log(`Menambahkan Opsi: ${OPTION_B1RU}`);
        
    //     // 3. Aksi: Klik 'Add option'
    //     // Mencari link "Add option" di bawah h3 "Attribute options"
    //     cy.contains('h3', /Attribute options|Pilihan Atribut/i)
    //         .parents('.card-section')
    //         .contains('a', /Add option|Tambah opsi/i) 
    //         .click(); 
        
    //     // 4. Aksi: Isi nama opsi 'Merah'
    //     // Selector input baru untuk opsi (menggunakan name attribute dan nilai yang belum diisi)
    //     cy.get('input[name*="options["][value=""]') 
    //         .should('be.visible')
    //         .last() // Jika ada input kosong lain, ambil yang terakhir (yang baru muncul)
    //         .type(OPTION_B1RU); 

    //     // --- Tambah Opsi Kedua (Biru) ---
    //     cy.log(`Menambahkan Opsi: ${OPTION_BIRU}`);
        
    //     // 5. Aksi: Klik 'Add option' lagi
    //     cy.contains('h3', /Attribute options|Pilihan Atribut/i)
    //         .parents('.card-section')
    //         .contains('a', /Add option|Tambah opsi/i) 
    //         .click(); 
        
    //     // 6. Aksi: Isi nama opsi 'Biru'
    //     // Mencari input kosong yang terakhir muncul
    //     cy.get('input[name*="options["][value=""]') 
    //         .should('be.visible')
    //         .last() 
    //         .type(OPTION_BIRU);
        
    //     // 7. Aksi: Klik tombol Save utama (untuk menyimpan kedua opsi sekaligus)
    //     cy.contains('button.primary', 'Save').click();
        
    //     // 8. Verifikasi: Muncul Pesan Sukses
    //     cy.contains(/success|berhasil/i).should('be.visible');

    //     // 9. Verifikasi Final: Kedua opsi ada di form setelah save dan refresh
    //     cy.url().should('include', '/admin/attributes/edit');
        
    //     // Verifikasi Merah ada
    //     cy.get('input[name*="option_text"][value="Biru"]').should('exist');
        
    //     // Verifikasi Biru ada
    //     cy.get('input[name*="option_text"][value="Biru"]').should('exist');
    // });

    // it('TC-056: verifikasi keamanan input pada field nama grup atribut', () => {
    //         // ... (Variabel spesifik TC-046) ...
    //         const UNIQUE_ID = Cypress._.random(0, 1e6);
    //         const NEW_ATTRIBUTE_NAME = "<script> alert('XSS')</script>"; 
    //         const ATTRIBUTE_CODE = 'warna_tc46_' + UNIQUE_ID; 
    //         const SORT_ORDER = '10';
            
    //         // 1. Precondition: Akses Halaman Daftar Atribut
    //         cy.visit(ATTRIBUTES_URL);
    //         cy.contains('h1', /Attributes|Daftar Atribut/i).should('be.visible');

    //         // 2. Aksi: Klik tombol 'New Attribute'
    //         cy.contains('a', /New Attribute|Tambah Atribut Baru/i).click();

    //         // 3. Verifikasi: Berada di halaman form pembuatan atribut
    //         cy.url().should('include', '/admin/attributes/new');

    //         // 4. Aksi: Isi Semua Field Wajib
    //         cy.log('Mengisi Nama, Code Atribut dan Sort Order');
    //         cy.get('input[name="attribute_name"]').should('be.visible').type(NEW_ATTRIBUTE_NAME);
    //         cy.get('input[name="attribute_code"]').should('be.visible').type(ATTRIBUTE_CODE);
    //         cy.get('input[name="sort_order"]').should('be.visible').type(SORT_ORDER);

    //         // 5. Aksi: Pilih Type 'Select' (Perbaikan Error 'not visible')
    //         cy.log('Memilih Tipe: Select dengan mengklik label');
    //         // Mengklik label yang berisi teks 'Select'
    //         cy.contains('label', 'Select').click(); 
            
    //         // Tambahan verifikasi: Pastikan input radio 'Select' sekarang checked
    //         cy.get('#type1').should('be.checked'); 

    //         // 6. Aksi: Klik tombol 'Save'
    //         cy.contains('button', /Save|Simpan/i).click(); 

    //         // 7. Verifikasi: Muncul Pesan Sukses
    //         cy.contains(/success|berhasil/i).should('be.visible');
            
    //         cy.visit(ATTRIBUTES_URL);
            
    //     });

    it('TC-057: verifikasi keamanan input pada field nama opsi atribut', () => {
        // Variabel hanya di sini
        const TARGET_ATTRIBUTE_NAME = 'Warna_TC46_16921'; 
        const OPTION_NAME = 'Test<img src=xoneror=alert(1)>'; 
        
        // 1. Aksi: Akses Halaman Edit Atribut
        cy.visit(ATTRIBUTES_URL);
        cy.contains('a', TARGET_ATTRIBUTE_NAME).click(); 
        
        // 2. Verifikasi: Berada di halaman edit
        cy.url().should('include', '/admin/attributes/edit');
        cy.contains('h3', /Attribute options|Pilihan Atribut/i).should('be.visible');


        // --- Tambah Opsi Pertama (Merah) ---
        cy.log(`Menambahkan Opsi: ${OPTION_NAME}`);
        
        // 3. Aksi: Klik 'Add option'
        // Mencari link "Add option" di bawah h3 "Attribute options"
        cy.contains('h3', /Attribute options|Pilihan Atribut/i)
            .parents('.card-section')
            .contains('a', /Add option|Tambah opsi/i) 
            .click(); 
        
        // 4. Aksi: Isi nama opsi 'Merah'
        // Selector input baru untuk opsi (menggunakan name attribute dan nilai yang belum diisi)
        cy.get('input[name*="options["][value=""]') 
            .should('be.visible')
            .last() // Jika ada input kosong lain, ambil yang terakhir (yang baru muncul)
            .type(OPTION_NAME); 

        // 7. Aksi: Klik tombol Save utama (untuk menyimpan kedua opsi sekaligus)
        cy.contains('button.primary', 'Save').click();
        
        // 8. Verifikasi: Muncul Pesan Sukses
        cy.contains(/success|berhasil/i).should('be.visible');

        // 9. Verifikasi Final: Kedua opsi ada di form setelah save dan refresh
        cy.url().should('include', '/admin/attributes/edit');
        
    });

});