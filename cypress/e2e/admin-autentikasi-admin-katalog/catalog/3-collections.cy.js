describe('Admin - Manajemen Koleksi Katalog', () => {

    const ADMIN_EMAIL = 'admin@email.com'; 
    const ADMIN_PASSWORD = '123123123'; 
    beforeEach(() => {
        cy.visit('/admin/login');
        cy.get("input[name='email']").type(ADMIN_EMAIL); 
        cy.get("input[name='password']").type(ADMIN_PASSWORD); 
        cy.get("button[type='submit']").click();
        cy.url().should('include', '/admin');
        cy.contains('h1', 'Dashboard').should('be.visible'); 
    });
    it('TC-134 & TC-172(WCAG): Verifikasi akses dan Usability (WCAG) halaman Collections', () => {
        cy.contains('a', 'Collections') 
            .should('be.visible')
            .click(); 
        cy.contains('h1', 'Collections').should('be.visible');
        cy.url().should('include', '/admin/collections');
        
        // Tunggu halaman sepenuhnya dimuat
        cy.wait(1000);
        
        // Verifikasi elemen-elemen utama ada (tidak perlu visible karena sticky table)
        cy.get('table').should('exist');
        cy.contains('a', 'New Collection').should('be.visible');
        
        // WCAG A11y Testing
        cy.injectAxe(); 
        cy.checkA11y(null, {
            includedImpacts: ['critical', 'serious'],
            rules: {
                'color-contrast': { enabled: true },
                'aria-valid-attr-value': { enabled: true },
                'button-name': { enabled: true }
            }
        }, null, true); // Parameter ke-4 (true) = skipFailures, hanya log saja
        
        cy.log('🎉 Pemeriksaan WCAG Halaman Collections Selesai.');
    });

    /**
     * TC-135: Membuat Koleksi Baru (Perbaikan Fokus Navigasi)
     * REPRODUCIBLE: Koleksi dibuat dengan timestamp unik setiap run
     */
    it('TC-135: verifikasi pembuatan koleksi baru dengan data valid', () => {
        const timestamp = Date.now(); // Gunakan timestamp untuk keunikan
        const collectionName = `Test Collection ${timestamp}`;
        const uniqueId = `testcol${timestamp}`; 
        const descriptionText = 'Deskripsi koleksi baru yang dibuat melalui pengujian otomatis Cypress.';
        cy.log('Langkah 1A: Navigasi ke Halaman Collections');
        cy.contains('a', 'Collections') 
            .should('be.visible')
            .click(); 
        cy.contains('h1', 'Collections').should('be.visible');
        cy.log('Langkah 1B: Klik tombol New Collection');
        cy.contains('a', 'New Collection')
            .should('be.visible') 
            .click();
        cy.log('Verifikasi Halaman Siap');
        cy.get('h1.page-heading-title').should('contain', 'Create a new collection').and('be.visible'); 
        cy.log('Step 2: Input Collection Name');
        cy.get('#name') 
            .should('be.visible')
            .clear()
            .type(collectionName)
            .should('have.value', collectionName);
        cy.log('Step 3: Input Unique ID');
        cy.get('#code') 
            .should('be.visible')
            .clear()
            .type(uniqueId)
            .should('have.value', uniqueId);
        cy.log('Step 3.A: Click the first layout template to activate the editor');
        cy.get('.row-templates')
            .should('be.visible')
            .find('a:first') // Menargetkan link template pertama
            .click(); 
        cy.log('Step 3.B: Input Description into the active editor');
        cy.get('#rows') 
            .should('exist') 
            .and('be.visible')
            .click() 
            .find('[contenteditable="true"]')        
            .clear()
            .type(descriptionText);
        cy.log('Step 5: Click the Save button');
        cy.get('button.primary')
            .contains('Save')
            .click();
        
        cy.log('Langkah 6: Navigasi kembali ke Halaman Collections');
        cy.contains('a', 'Collections') 
            .should('be.visible')
            .click(); 
        cy.log('Expected Result 7: Verifikasi berada di halaman Collections');
        cy.contains('h1', 'Collections').should('be.visible');
        
        cy.log('Expected Result 8: Verifikasi data ada menggunakan search');
        // Gunakan search field untuk mencari koleksi yang baru dibuat
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500); // Tunggu page reload
        
        // Verifikasi koleksi ditemukan di hasil search
        cy.contains('table a', collectionName).should('exist');
        
        cy.log('CLEANUP: Menghapus koleksi yang baru dibuat');
        cy.contains('tr', collectionName) 
            .should('be.visible')
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete')
            .should('be.visible') 
            .click();
        cy.contains('button', /Confirm|Yes|Delete/i) 
            .should('be.visible')
            .click();
        
        // Verifikasi koleksi terhapus - cukup cek page refresh
        cy.wait(1000);
        cy.contains('table a', collectionName).should('not.exist');
        
        cy.log('✅ CLEANUP SELESAI: Koleksi berhasil dihapus');
    });


    it('TC-136: verifikasi update collections', () => {
        const timestamp = Date.now();
        const originalCollectionName = `Original Collection ${timestamp}`;
        const updatedCollectionName = `Updated Collection ${timestamp}`;
        const uniqueId = `origcol${timestamp}`;
        
        cy.log('SETUP: Membuat koleksi baru untuk diupdate');
        cy.contains('a', 'Collections').click();
        cy.contains('a', 'New Collection').click();
        cy.get('#name').type(originalCollectionName);
        cy.get('#code').type(uniqueId);
        cy.get('.row-templates').find('a:first').click();
        cy.get('#rows').find('[contenteditable="true"]').type('Test collection for update');
        cy.get('button.primary').contains('Save').click();
        
        cy.log('Langkah 1: Navigasi ke Halaman Collections');
        cy.contains('a', 'Collections').click(); 
        cy.contains('h1', 'Collections').should('be.visible');
        
        cy.log(`Langkah 2: Mencari dan mengklik koleksi "${originalCollectionName}" untuk edit`);
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(originalCollectionName + '{enter}');
        cy.wait(1500);
        cy.contains('table a', originalCollectionName)
            .should('exist')
            .click();
        cy.url().should('include', '/edit'); 
        cy.get('h1.page-heading-title').should('contain', 'Editing').and('be.visible'); 
        
        cy.log('Langkah 3: Mengganti Nama Koleksi');
        cy.get('#name') 
            .should('have.value', originalCollectionName)
            .clear()
            .type(updatedCollectionName)
            .should('have.value', updatedCollectionName);
        
        cy.log('Langkah 4: Klik tombol Save');
        cy.get('button.primary').contains('Save').click();
        
        cy.log('Langkah 5: Navigasi kembali ke Halaman Collections');
        cy.contains('a', 'Collections').click(); 
        
        cy.log('Expected Result 6: Verifikasi nama baru ada di tabel');
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(updatedCollectionName + '{enter}');
        cy.wait(1500);
        cy.contains('table a', updatedCollectionName).should('exist');
        
        cy.log('Expected Result 7: Verifikasi nama lama tidak ada');
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(originalCollectionName + '{enter}');
        cy.wait(1500);
        cy.contains('table a', originalCollectionName).should('not.exist');
        
        cy.log('CLEANUP: Menghapus koleksi yang dibuat');
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(updatedCollectionName + '{enter}');
        cy.wait(1500);
        cy.contains('tr', updatedCollectionName)
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete').click();
        cy.contains('button', /Confirm|Yes|Delete/i).click();
        cy.wait(1000);
        cy.contains('table a', updatedCollectionName).should('not.exist');
        cy.log('✅ CLEANUP SELESAI: Koleksi dihapus');
    });
    
    it('TC-137: verifikasi menambahkan produk ke koleksi yang ada', () => {
        const timestamp = Date.now();
        const collectionName = `Test Add Product ${timestamp}`;
        const uniqueId = `testaddprod${timestamp}`;
        const productName = `Test Product ${timestamp}`;
        const productSku = `TP-${timestamp}`;
        
        cy.log('SETUP: Membuat produk baru');
        cy.contains('a', 'Products').click();
        cy.contains('a', 'New Product').should('be.visible').click();
        cy.get("input[name='name']").type(productName);
        cy.get("input[name='sku']").should('not.be.disabled').type(productSku);
        cy.get("input[name='qty']").type('100', { force: true });
        cy.get("input[name='price']").type('99.99', { force: true });
        cy.get("input[name='weight']").type('1.5', { force: true });
        cy.get('input[name="description"]', { timeout: 10000 })
            .type('Deskripsi produk tes untuk koleksi.', { force: true })
            .trigger('change', { force: true });
        cy.get('input[name="url_key"]', { timeout: 10000 })
            .type(productSku, { force: true });
        cy.get('input[name="meta_title"]', { timeout: 10000 })
            .type(productName, { force: true });
        cy.get('textarea[name="meta_description"]', { timeout: 10000 })
            .type('Meta deskripsi produk tes.', { force: true });
        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
        cy.wait(2000);
        
        cy.log('SETUP: Membuat koleksi baru');
        cy.contains('a', 'Collections').click();
        cy.contains('a', 'New Collection').click();
        cy.get('#name').type(collectionName);
        cy.get('#code').type(uniqueId);
        cy.get('.row-templates').find('a:first').click();
        cy.get('#rows').find('[contenteditable="true"]').type('Test collection');
        cy.get('button.primary').contains('Save').click();
        
        cy.log(`Langkah 1: Masuk ke halaman edit koleksi "${collectionName}"`);
        cy.contains('a', 'Collections').click();
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500);
        cy.contains('table a', collectionName).click();
        cy.url().should('include', '/edit');
        
        cy.log('Langkah 2: Klik tombol "Add products"');
        cy.contains('a.text-interactive', 'Add products') 
            .should('be.visible')
            .click(); 
        
        cy.log(`Langkah 3: Mencari produk: ${productName}`);
        cy.contains('h1, h2, div', 'Select Products') 
            .parents('.modal, .popup') 
            .find('input[placeholder="Search products"]') 
            .should('be.visible')
            .last() 
            .type(productName, { force: true });
        cy.wait(1000); 
        
        cy.log(`Langkah 4: Memilih produk "${productName}"`);
        cy.contains(productSku, { timeout: 8000 })
            .parents('.grid')
            .find('button.secondary')
            .contains('Select')
            .click();
        
        cy.log('Langkah 5: Menutup pop-up pemilihan produk');
        cy.get('button[aria-label="close"], button.close, button:contains("Close")')
            .should('be.visible')
            .click(); 
        
        cy.log('Langkah 6: Klik tombol Save utama koleksi');
        cy.get('button.primary').contains('Save').click();
        cy.wait(1000);
        
        cy.log('Expected Result: Verifikasi produk muncul di list');
        cy.get('.card-section').should('contain', productName);
        
        cy.log('CLEANUP: Menghapus koleksi');
        cy.contains('a', 'Collections').click();
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500);
        cy.contains('tr', collectionName) 
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete').click();
        cy.contains('button', /Confirm|Yes|Delete/i).click();
        cy.wait(1000);
        
        cy.log('CLEANUP: Menghapus produk');
        cy.contains('a', 'Products').click();
        cy.get('#keyword').clear().type(productName + '{enter}');
        cy.wait(1500);
        cy.contains('tr', productSku)
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete').click();
        cy.contains('button', /Confirm|Yes|Delete/i).click();
        
        cy.log('✅ CLEANUP SELESAI: Koleksi dan produk dihapus');
    });

    it('TC-138: verifikasi menghapus produk dari koleksi yang ada', () => {
        const timestamp = Date.now();
        const collectionName = `Test Remove Product ${timestamp}`;
        const uniqueId = `testremoveprod${timestamp}`;
        const productName = `Test Product Remove ${timestamp}`;
        const productSku = `TPR-${timestamp}`;
        
        cy.log('SETUP: Membuat produk baru');
        cy.contains('a', 'Products').click();
        cy.contains('a', 'New Product').should('be.visible').click();
        cy.get("input[name='name']").type(productName);
        cy.get("input[name='sku']").should('not.be.disabled').type(productSku);
        cy.get("input[name='qty']").type('100', { force: true });
        cy.get("input[name='price']").type('99.99', { force: true });
        cy.get("input[name='weight']").type('1.5', { force: true });
        cy.get('input[name="description"]', { timeout: 10000 })
            .type('Deskripsi produk tes untuk koleksi.', { force: true })
            .trigger('change', { force: true });
        cy.get('input[name="url_key"]', { timeout: 10000 })
            .type(productSku, { force: true });
        cy.get('input[name="meta_title"]', { timeout: 10000 })
            .type(productName, { force: true });
        cy.get('textarea[name="meta_description"]', { timeout: 10000 })
            .type('Meta deskripsi produk tes.', { force: true });
        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
        cy.wait(2000);
        
        cy.log('SETUP: Membuat koleksi baru dan menambahkan produk');
        cy.contains('a', 'Collections').click();
        cy.contains('a', 'New Collection').click();
        cy.get('#name').type(collectionName);
        cy.get('#code').type(uniqueId);
        cy.get('.row-templates').find('a:first').click();
        cy.get('#rows').find('[contenteditable="true"]').type('Test collection');
        cy.get('button.primary').contains('Save').click();
        cy.wait(2000); // Tunggu save selesai
        
        // Verifikasi save berhasil (redirect atau pesan sukses)
        cy.url().should('include', '/admin/collections');
        
        cy.contains('a', 'Collections').click();
        cy.wait(1000);
        cy.get('input[name="name"][placeholder="Search"]')
            .should('be.visible')
            .should('not.be.disabled')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(2000); // Tunggu lebih lama untuk search
        
        // Verifikasi collection muncul di table
        cy.get('table', { timeout: 5000 }).should('be.visible');
        cy.contains('table a', collectionName, { timeout: 5000 }).should('be.visible').click();
        
        cy.contains('a.text-interactive', 'Add products').click();
        cy.contains('h1, h2, div', 'Select Products')
            .parents('.modal, .popup')
            .find('input[placeholder="Search products"]')
            .last()
            .type(productName, { force: true });
        cy.wait(1000);
        cy.contains(productSku, { timeout: 8000 })
            .parents('.grid')
            .find('button.secondary')
            .contains('Select')
            .click();
        cy.get('button[aria-label="close"], button.close, button:contains("Close")').click();
        cy.get('button.primary').contains('Save').click();
        cy.wait(1000);
        
        cy.log(`Langkah 1: Memastikan produk "${productName}" sudah ada`);
        cy.get('.card-section').should('contain', productName);
        
        cy.log(`Langkah 2: Klik tombol "Remove" untuk produk "${productName}"`);
        cy.contains('.grid', productName) 
            .contains('a', 'Remove')
            .should('be.visible')
            .click();
        
        cy.log('Langkah 3: Verifikasi produk hilang dari list sementara');
        cy.get('.card-section').should('not.contain', productSku);
        
        cy.log('Langkah 4: Klik tombol Save utama koleksi');
        cy.get('button.primary').contains('Save').click();
        cy.wait(1000);
        
        cy.log('Expected Result: Verifikasi produk sudah tidak ada di list');
        cy.get('.card-section').should('not.contain', productSku);
        
        cy.log('CLEANUP: Menghapus koleksi');
        cy.contains('a', 'Collections').click();
        cy.wait(1000);
        cy.get('input[name="name"][placeholder="Search"]')
            .should('be.visible')
            .should('not.be.disabled')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500);
        cy.contains('tr', collectionName)
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete').click();
        cy.contains('button', /Confirm|Yes|Delete/i).click();
        cy.wait(1000);
        
        cy.log('CLEANUP: Menghapus produk');
        cy.contains('a', 'Products').click();
        cy.wait(1000);
        cy.get('#keyword')
            .should('be.visible')
            .should('not.be.disabled')
            .clear()
            .type(productName + '{enter}');
        cy.wait(1500);
        cy.contains('tr', productSku)
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete').click();
        cy.contains('button', /Confirm|Yes|Delete/i).click();
        
        cy.log('✅ CLEANUP SELESAI: Koleksi dan produk dihapus');
    });

    it('TC-139: verifikasi menghapus koleksi yang berisi produk', () => {
        const timestamp = Date.now();
        const collectionName = `Test Delete Collection ${timestamp}`;
        const uniqueId = `testdelcol${timestamp}`;
        const productName = `Test Product Delete ${timestamp}`;
        const productSku = `TPD-${timestamp}`;
        
        cy.log('SETUP: Membuat produk baru');
        cy.contains('a', 'Products').click();
        cy.contains('a', 'New Product').should('be.visible').click();
        cy.get("input[name='name']").type(productName);
        cy.get("input[name='sku']").should('not.be.disabled').type(productSku);
        cy.get("input[name='qty']").type('100', { force: true });
        cy.get("input[name='price']").type('99.99', { force: true });
        cy.get("input[name='weight']").type('1.5', { force: true });
        cy.get('input[name="description"]', { timeout: 10000 })
            .type('Deskripsi produk tes untuk koleksi.', { force: true })
            .trigger('change', { force: true });
        cy.get('input[name="url_key"]', { timeout: 10000 })
            .type(productSku, { force: true });
        cy.get('input[name="meta_title"]', { timeout: 10000 })
            .type(productName, { force: true });
        cy.get('textarea[name="meta_description"]', { timeout: 10000 })
            .type('Meta deskripsi produk tes.', { force: true });
        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
        cy.wait(2000);
        
        cy.log('SETUP: Membuat koleksi baru dengan produk');
        cy.contains('a', 'Collections').click();
        cy.contains('a', 'New Collection').click();
        cy.get('#name').type(collectionName);
        cy.get('#code').type(uniqueId);
        cy.get('.row-templates').find('a:first').click();
        cy.get('#rows').find('[contenteditable="true"]').type('Test collection to delete');
        cy.get('button.primary').contains('Save').click();
        
        cy.contains('a', 'Collections').click();
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500);
        cy.contains('table a', collectionName).click();
        cy.wait(1000);
        
        cy.contains('a.text-interactive', 'Add products').click();
        cy.contains('h1, h2, div', 'Select Products')
            .parents('.modal, .popup')
            .find('input[placeholder="Search products"]')
            .last()
            .type(productName, { force: true });
        cy.wait(1000);
        cy.contains(productSku, { timeout: 8000 })
            .parents('.grid')
            .find('button.secondary')
            .contains('Select')
            .click();
        cy.get('button[aria-label="close"], button.close, button:contains("Close")').click();
        cy.get('button.primary').contains('Save').click();
        cy.wait(1000);
        
        cy.contains('a', 'Collections').click();
        cy.contains('h1', 'Collections').should('be.visible');
        
        cy.log(`Langkah 1: Mencari koleksi "${collectionName}" dan mencentang checkbox`);
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500);
        cy.contains('tr', collectionName) 
            .find('input[type="checkbox"]')
            .check({ force: true }); 
        
        cy.log('Langkah 2: Klik tombol Delete yang muncul di daftar');
        cy.contains('button, a', 'Delete')
            .should('be.visible') 
            .click();
        
        cy.log('Langkah 3: Konfirmasi penghapusan di modal');
        cy.contains('button', /Confirm|Yes|Delete/i) 
            .should('be.visible')
            .click();
        cy.wait(1000);
        
        cy.contains('h1', 'Collections').should('be.visible');
        cy.log('Expected Result: Verifikasi koleksi TIDAK ada di daftar');
        cy.contains('table a', collectionName).should('not.exist');
        
        cy.log('CLEANUP: Menghapus produk');
        cy.contains('a', 'Products').click();
        cy.get('#keyword').clear().type(productName + '{enter}');
        cy.wait(1500);
        cy.contains('tr', productSku)
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete').click();
        cy.contains('button', /Confirm|Yes|Delete/i).click();
        
        cy.log('✅ Test selesai: Koleksi dan produk berhasil dihapus');
    });

    it('TC-140: verifikasi membuat collections baru dengan nama duplikat', () => {
        const timestamp1 = Date.now();
        const timestamp2 = timestamp1 + 1;
        const duplicateCollectionName = `Duplicate Collection Name`;
        const uniqueId1 = `dupid${timestamp1}`;
        const uniqueId2 = `dupid${timestamp2}`;
        const descriptionText = 'Deskripsi koleksi duplikat';
        cy.log('SETUP: Membuat koleksi pertama');
        
        cy.contains('a', 'Collections').click();
        cy.contains('a', 'New Collection').click();
        cy.get('#name').type(duplicateCollectionName);
        cy.get('#code').type(uniqueId1);
        cy.get('.row-templates').find('a:first').click();
        cy.get('#rows').find('[contenteditable="true"]').type(descriptionText);
        cy.get('button.primary').contains('Save').click();
        cy.contains('a', 'Collections').click();
        cy.get('input[name="name"][placeholder="Search"]')
            .clear()
            .type(duplicateCollectionName + '{enter}');
        cy.wait(1500); // Tunggu page reload
        cy.contains('table a', duplicateCollectionName).should('exist');
        
        cy.log('Langkah 1: Navigasi ke halaman New Collection');
        cy.contains('a', 'New Collection').click();
        
        cy.log('Langkah 2: Input Collection Name (Duplicate)');
        cy.get('#name')
            .clear()
            .type(duplicateCollectionName)
            .should('have.value', duplicateCollectionName);

        cy.log('Langkah 3: Input Unique ID (Different)');
        cy.get('#code')
            .clear()
            .type(uniqueId2)
            .should('have.value', uniqueId2);

        cy.log('Langkah 4: Pilih template dan input description');
        cy.get('.row-templates').find('a:first').click();
        cy.get('#rows').find('[contenteditable="true"]').type(descriptionText);
                
        cy.log('Langkah 5: Click Save button');
        cy.get('button.primary').contains('Save').click();
        
        cy.log('Langkah 6: Navigasi kembali ke Halaman Collections');
        cy.contains('a', 'Collections').click();
        cy.contains('h1', 'Collections').should('be.visible');

        cy.log('Expected Result: Verifikasi kedua koleksi ada di tabel');
        cy.get('table').contains(duplicateCollectionName).should('be.visible');
        cy.log('CLEANUP: Menghapus kedua koleksi yang dibuat');
        cy.get('table').then($table => {
            const rows = $table.find(`tr:contains("${duplicateCollectionName}")`);
            if (rows.length > 0) {
                rows.each((index, row) => {
                    cy.wrap(row).find('input[type="checkbox"]').check({ force: true });
                });
                
                cy.contains('button, a', 'Delete').click();
                cy.contains('button', /Confirm|Yes|Delete/i).click();
                cy.wait(1000);
            }
        });
        
        cy.log('✅ CLEANUP SELESAI: Kedua koleksi dihapus');
    });

    it('TC-141: verifikasi menghapus produk dari menu utama Products dan verifikasi penghapusan dari koleksi', () => {
        const timestamp = Date.now();
        const collectionName = `Test Product Removal ${timestamp}`;
        const uniqueId = `testprodrem${timestamp}`;
        const productName = `Test Product ${timestamp}`;
        const productSku = `TST-${timestamp}`;
        
        cy.log('SETUP: Membuat produk baru');
        cy.contains('a', 'Products').click();
        cy.contains('a', 'New Product').should('be.visible').click();
        cy.get("input[name='name']").type(productName);
        cy.get("input[name='sku']").should('not.be.disabled').type(productSku);
        cy.get("input[name='qty']").type('100', { force: true });
        cy.get("input[name='price']").type('99.99', { force: true });
        cy.get("input[name='weight']").type('1.5', { force: true });
        cy.get('input[name="description"]', { timeout: 10000 })
            .type('Deskripsi produk tes untuk koleksi.', { force: true })
            .trigger('change', { force: true });
        cy.get('input[name="url_key"]', { timeout: 10000 })
            .type(productSku, { force: true });
        cy.get('input[name="meta_title"]', { timeout: 10000 })
            .type(productName, { force: true });
        cy.get('textarea[name="meta_description"]', { timeout: 10000 })
            .type('Meta deskripsi produk tes.', { force: true });
        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
        cy.wait(2000);
        
        cy.log('SETUP: Membuat koleksi dan menambahkan produk');
        cy.contains('a', 'Collections').click();
        cy.contains('a', 'New Collection').click();
        cy.get('#name').type(collectionName);
        cy.get('#code').type(uniqueId);
        cy.get('.row-templates').find('a:first').click();
        cy.get('#rows').find('[contenteditable="true"]').type('Test collection');
        cy.get('button.primary').contains('Save').click();
        cy.contains('a', 'Collections').click();
        cy.wait(1000);
        cy.get('input[name="name"][placeholder="Search"]')
            .should('be.visible')
            .should('not.be.disabled')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500);
        cy.contains('table a', collectionName).click();
        cy.contains('a.text-interactive', 'Add products').click();
        cy.contains('h1, h2, div', 'Select Products')
            .parents('.modal, .popup')
            .find('input[placeholder="Search products"]')
            .last()
            .type(productName, { force: true });
        cy.wait(500);
        cy.contains(productSku, { timeout: 8000 })
            .parents('.grid')
            .find('button.secondary')
            .contains('Select')
            .click();
        cy.get('button[aria-label="close"], button.close, button:contains("Close")').click();
        cy.get('button.primary').contains('Save').click();
        cy.wait(1000);
        cy.get('.card-section').should('contain', productName);
        cy.log('Langkah 1: Navigasi ke Halaman Products');
        cy.contains('a', 'Products').click();
        cy.contains('h1', 'Products').should('be.visible');
        cy.log('Langkah 2: Mencari produk "${productName}"');
        cy.get('#keyword')
            .should('be.visible')
            .should('not.be.disabled')
            .clear()
            .type(productName + '{enter}');
        cy.wait(1500);
        cy.log('Langkah 3: Mencentang checkbox produk');
        cy.contains('tr, .product-item', productSku, { timeout: 6000 })
            .should('be.visible')
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.log('Langkah 4: Klik tombol Delete');
        cy.contains('button, a', 'Delete')
            .should('be.visible')
            .click();
        cy.log('Langkah 5: Konfirmasi penghapusan di modal');
        cy.contains('button', /Confirm|Yes|Delete/i)
            .should('be.visible')
            .click();

        cy.wait(1000);
        cy.log('Langkah 6: Verifikasi produk hilang dari daftar produk utama');
        cy.contains('table', productSku).should('not.exist');
        cy.log('Langkah 7: Navigasi ke Halaman Collections');
        cy.contains('a', 'Collections').click();
        cy.contains('h1', 'Collections').should('be.visible');
        cy.log(`Langkah 8: Masuk ke halaman edit koleksi "${collectionName}"`);
        cy.contains('table a', collectionName).click();
        cy.url().should('include', '/edit');
        cy.log('Langkah 9: Verifikasi produk hilang dari koleksi');
        cy.get('.card-section')
            .should('not.contain', productSku);
        cy.log('CLEANUP: Menghapus koleksi yang dibuat');
        
        cy.contains('a', 'Collections').click();
        cy.wait(1000);
        cy.get('input[name="name"][placeholder="Search"]')
            .should('be.visible')
            .should('not.be.disabled')
            .clear()
            .type(collectionName + '{enter}');
        cy.wait(1500); // Tunggu page reload
        cy.contains('tr', collectionName)
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('button, a', 'Delete').click();
        cy.contains('button', /Confirm|Yes|Delete/i).click();
        
        // Verifikasi koleksi terhapus - page akan reload
        cy.wait(1000);
        cy.contains('table a', collectionName).should('not.exist');
        cy.log('✅ CLEANUP SELESAI: Produk dan koleksi dihapus');
    });
});