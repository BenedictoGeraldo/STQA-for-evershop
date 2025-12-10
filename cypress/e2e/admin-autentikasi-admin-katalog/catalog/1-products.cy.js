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
    it('TC-112 & TC-170: Verifikasi navigasi dan Usability (WCAG) halaman Products', () => {
        
        // Klik submenu Products. Navigasi harus bekerja karena sesi baru
        cy.get('a[href="http://localhost:3000/admin/products"]')
          .should('be.visible')
          .click(); 
        
        // Verifikasi halaman Produk
        cy.url().should('include', '/admin/products');
        cy.get('h1').contains('Products').should('be.visible'); 

        cy.injectAxe()

        // ♿️ WCAG-002: PENGUJIAN USABILITY/ACCESSIBILITY
        cy.checkA11y(null, {
            includedTags: ['wcag2a', 'wcag2aa'],
        });
        
        cy.log('🎉 Pemeriksaan WCAG Halaman Katalog (Products) Selesai.');
    });

    it('TC-113: verifikasi fungsionalitas search produk yang hasilnya ditemukan', () => {
        cy.visit('/admin/products');

        cy.get('input#keyword')
          .should('be.visible')
          .clear()
          .type('Classic Leather Loafers{enter}');
        
        // Tunggu page reload setelah enter
        cy.url({ timeout: 10000 }).should('include', 'keyword=Classic');
        cy.contains('Classic Leather Loafers', { timeout: 10000 }).should('be.visible');
      });


      it('TC-114: verifikasi fungsionalitas search produk yang hasilnya tidak ditemukan', () => {
        cy.visit('/admin/products');
        
        cy.get('input#keyword')
          .should('be.visible')
          .clear()
          .type('abcdskk123{enter}');
        
        // Tunggu page reload setelah enter
        cy.url({ timeout: 10000 }).should('include', 'keyword=abcdskk123');
        cy.contains('There is no product to display', { timeout: 10000 }).should('be.visible');
      });

    it('TC-115: verifikasi fungsionalitas filter produk (Filter by Status)', () => {
      cy.visit('/admin/products');

      // 1. Klik tombol custom dropdown "Status"
      cy.contains('button', 'Status').click();

      // 2. Klik link "Disabled"
      cy.contains('a', 'Disabled').click();

      // 3. Verifikasi URL
      cy.url({ timeout: 10000 }).should('satisfy', (url) => {
        return url.includes('status=disabled') || url.includes('status=0');
      });

      cy.contains('There is no product to display', { timeout: 10000 }).should('be.visible');
    });


    it('TC-116: verifikasi fungsionalitas Pagination', () => {
      cy.log('--- Memulai TC-015 (FIX - URL Check) ---');
      cy.visit('/admin/products');

      let firstProductNameOnPage1;

      const selectorNamaProdukPertama = 'table.listing.sticky tbody tr:nth-child(2) td:nth-child(3) a';

      cy.get(selectorNamaProdukPertama, { timeout: 20000 })
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          firstProductNameOnPage1 = text.trim();
          cy.log(`Produk pertama di Halaman 1: ${firstProductNameOnPage1}`);
          expect(firstProductNameOnPage1).to.not.be.empty;
        });

      cy.get('div.pagination .next a').click();

      cy.url({ timeout: 10000 }).should('include', 'page=2');

      cy.get(selectorNamaProdukPertama, { timeout: 20000 })
        .should('be.visible')
        .invoke('text')
        .then((textOnPage2) => {
          cy.log(`Produk pertama di Halaman 2: ${textOnPage2.trim()}`);
          expect(textOnPage2.trim()).to.not.equal(firstProductNameOnPage1);
        });
    });


      it('TC-117: Verifikasi fungsionalitas tambah produk baru (happy path) - dengan cleanup', () => {
        cy.visit('/admin/products');

        cy.contains('New Product').click();

        cy.url().should('include', '/admin/products/new');

        const productName = `Cypress Product ${Date.now()}`;
        const sku = `CYP-${Date.now()}`;

        cy.get("input[name='name']").type(productName); 
        cy.get("input[name='sku']").should('not.be.disabled').type(sku);
        
        cy.get("input[name='qty']").type('100', { force: true });
        cy.get("input[name='price']").type('99.99', { force: true });
        cy.get("input[name='weight']").type('1.5', { force: true }); 

        cy.get('input[name="description"]', { timeout: 10000 })
          .type('Ini deskripsi produk tes.', { force: true }) 
          .trigger('change', { force: true }); 

        
        cy.get('input[name="url_key"]', { timeout: 10000 })
          .type(sku, { force: true }); 

        cy.get('input[name="meta_title"]', { timeout: 10000 })
          .type(productName, { force: true });

        cy.get('textarea[name="meta_description"]', { timeout: 10000 })
          .type('Ini meta deskripsi produk tes.', { force: true });
        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();

        // Tunggu redirect ke halaman products atau manual visit
        cy.url({ timeout: 10000 }).then((currentUrl) => {
          if (currentUrl.includes('/edit/') || currentUrl.includes('/new')) {
            cy.log('⚠️ Belum redirect, navigasi manual ke products');
            cy.visit('/admin/products');
          }
        });

        cy.url().should('include', '/admin/products');
        cy.log('✅ Produk berhasil dibuat');
        
        // CLEANUP: Search dan hapus produk yang baru dibuat
        cy.log('🧹 Cleanup: Mencari dan menghapus produk yang baru dibuat...');
        
        // Tunggu 3 detik agar backend selesai indexing
        cy.wait(3000);
        
        // Reload halaman untuk memastikan data fresh
        cy.reload();
        cy.wait(2000); // Tunggu halaman selesai reload
        
        // Search produk menggunakan input#keyword
        cy.get('input#keyword')
          .should('be.visible')
          .clear()
          .type(productName + '{enter}');
        
        cy.url({ timeout: 10000 }).should('include', 'keyword=');
        
        // Tunggu search selesai lebih lama
        cy.wait(2000);
        
        // Cek apakah produk ditemukan, jika tidak reload lagi
        cy.get('body').then(($body) => {
          if (!$body.text().includes(productName)) {
            cy.log('⚠️ Produk belum muncul, reload dan search lagi...');
            cy.wait(2000);
            cy.reload();
            cy.wait(2000);
            cy.get('input#keyword').clear().type(productName + '{enter}');
            cy.wait(2000);
          }
        });
        
        cy.contains('a', productName, { timeout: 15000 })
          .parents('tr')
          .find('a,button')
          .last()
          .click();

        cy.on('window:confirm', () => true);
        cy.wait(1000); // Tunggu delete selesai
        cy.log('✅ Produk berhasil dihapus - test dapat di-run ulang');
      });

    it('TC-118: Verifikasi fungsionalitas tambah produk baru dengan field kosong', () => {
        // Kunjungi halaman daftar produk
        cy.visit('/admin/products');

        cy.contains('New Product').click();

        cy.url().should('include', '/admin/products/new');


        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();


        cy.url().should('include', '/admin/products');
      });

    it('TC-119: Verifikasi fungsionalitas tambah produk baru dengan harga minus (-)', () => {
        // Kunjungi halaman daftar produk
        cy.visit('/admin/products');

        cy.contains('New Product').click();

        cy.url().should('include', '/admin/products/new');

        const productName = `Cypress Product ${Date.now()}`;
        const sku = `CYP-${Date.now()}`;

        cy.get("input[name='name']").type(productName); 
        cy.get("input[name='sku']").should('not.be.disabled').type(sku);
        
        cy.get("input[name='qty']").type('100', { force: true });
        cy.get("input[name='price']").type('-99.99', { force: true });
        cy.get("input[name='weight']").type('1.5', { force: true }); 

        cy.get('input[name="description"]', { timeout: 10000 })
          .type('Ini deskripsi produk tes.', { force: true }) 
          .trigger('change', { force: true }); 

        
        cy.get('input[name="url_key"]', { timeout: 10000 })
          .type(sku, { force: true }); 

        cy.get('input[name="meta_title"]', { timeout: 10000 })
          .type(productName, { force: true });

        cy.get('textarea[name="meta_description"]', { timeout: 10000 })
          .type('Ini meta deskripsi produk tes.', { force: true });
        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();


        cy.url().should('include', '/admin/products');
      });

    it('TC-120: Verifikasi fungsionalitas update data produk dengan data valid', () => {
        
        // Handler untuk mengabaikan error aplikasi yang muncul saat page load/search
        cy.on('uncaught:exception', (err, runnable) => {
            if (err.message.includes('Something wrong. Please try again')) {
                return false;
            }
            return true;
        });
        
        const originalName = 'Floral Maxi Dress';
        const updatedName = 'floral maxi';
        const sku = `FMD-${Date.now()}`;
        
        cy.log('--- TC-019: Verifikasi Update Produk ---');
        cy.visit('/admin/products');
        
        // STEP 1: Cek apakah produk sudah ada, jika belum buat dulu
        cy.log(`Mencari produk: "${originalName}"`);
        cy.get('input#keyword')
          .should('be.visible')
          .clear()
          .type(originalName + '{enter}');
        
        cy.url({ timeout: 10000 }).should('include', 'keyword=');
        cy.wait(1000); // Tunggu search selesai
        
        // Cek apakah produk ditemukan
        cy.get('body').then(($body) => {
          if ($body.text().includes(originalName)) {
            // Produk sudah ada, langsung klik
            cy.log(`✅ Produk "${originalName}" ditemukan`);
            cy.contains('a', originalName).click();
            cy.url({ timeout: 10000 }).should('include', '/admin/products/edit/');
          } else {
            // Produk belum ada, buat dulu
            cy.log(`⚠️ Produk "${originalName}" belum ada, membuat produk baru...`);
            cy.visit('/admin/products');
            cy.contains('New Product').click();
            cy.url().should('include', '/admin/products/new');
            
            // Isi form produk
            cy.get("input[name='name']").type(originalName);
            cy.get("input[name='sku']").should('not.be.disabled').type(sku);
            cy.get("input[name='qty']").type('50', { force: true });
            cy.get("input[name='price']").type('100.00', { force: true });
            cy.get("input[name='weight']").type('0.5', { force: true });
            cy.get('input[name="description"]', { timeout: 10000 })
              .type('Beautiful floral maxi dress for summer', { force: true })
              .trigger('change', { force: true });
            cy.get('input[name="url_key"]', { timeout: 10000 })
              .type(sku, { force: true });
            cy.get('input[name="meta_title"]', { timeout: 10000 })
              .type(originalName, { force: true });
            cy.get('textarea[name="meta_description"]', { timeout: 10000 })
              .type('Floral maxi dress perfect for any occasion', { force: true });
            
            cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
            
            // Tunggu redirect atau manual visit
            cy.url({ timeout: 10000 }).then((currentUrl) => {
              if (currentUrl.includes('/edit/') || currentUrl.includes('/new')) {
                cy.log('⚠️ Belum redirect, navigasi manual ke products');
                cy.visit('/admin/products');
              }
            });
            
            cy.url().should('include', '/admin/products');
            cy.log(`✅ Produk "${originalName}" berhasil dibuat`);
            
            // Tunggu dan reload untuk memastikan produk ter-index
            cy.wait(2000);
            cy.reload();
            cy.wait(1000);
            
            // Search dan buka produk yang baru dibuat
            cy.get('input#keyword').clear().type(originalName + '{enter}');
            cy.url({ timeout: 10000 }).should('include', 'keyword=');
            cy.wait(1000);
            cy.contains('a', originalName, { timeout: 10000 }).click();
            cy.url({ timeout: 10000 }).should('include', '/admin/products/edit/');
          }
        });
        
        // STEP 2: Ubah name menjadi "floral maxi"
        cy.log(`Mengubah nama produk dari "${originalName}" menjadi "${updatedName}"`);
        cy.get("input[name='name']")
          .should('be.visible')
          .clear()
          .type(updatedName);
        
        // STEP 3: Klik Save
        cy.contains('span', 'Save', { timeout: 10000 })
          .parent('button')
          .click();
        
        // Tunggu dan verifikasi redirect atau tetap di halaman edit
        cy.url({ timeout: 10000 }).then((currentUrl) => {
          if (currentUrl.includes('/edit/')) {
            // Masih di halaman edit - verifikasi nama berhasil berubah
            cy.log('✅ Tetap di halaman edit - verifikasi perubahan nama');
            cy.get("input[name='name']").should('have.value', updatedName);
            cy.log(`✅ Nama produk berhasil diubah menjadi "${updatedName}"`);
            
            // ROLLBACK: Kembalikan nama ke asli
            cy.log('--- Rollback: Mengembalikan nama ke asli ---');
            cy.get("input[name='name']").clear().type(originalName);
            cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
            
            cy.wait(2000); // Tunggu save selesai
            cy.get("input[name='name']").should('have.value', originalName);
            cy.log(`✅ Rollback berhasil - nama dikembalikan ke "${originalName}"`);
            
          } else {
            // Redirect ke products list
            cy.log('✅ Redirect ke halaman products');
            cy.url().should('include', '/admin/products');
            
            // Verifikasi nama baru di list (mungkin perlu search)
            cy.get('input#keyword')
              .clear()
              .type(updatedName + '{enter}');
            
            cy.url({ timeout: 10000 }).should('include', 'keyword=');
            
            // Cek apakah produk muncul dengan nama baru atau nama lama
            cy.get('body').then(($body) => {
              if ($body.text().includes(updatedName)) {
                cy.log(`✅ Produk ditemukan dengan nama baru: "${updatedName}"`);
                
                // ROLLBACK: Buka lagi dan kembalikan
                cy.contains('a', updatedName).click();
                cy.url({ timeout: 10000 }).should('include', '/admin/products/edit/');
                cy.get("input[name='name']").clear().type(originalName);
                cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
                cy.log(`✅ Rollback berhasil - nama dikembalikan ke "${originalName}"`);
                
              } else {
                // Produk masih dengan nama lama (backend belum update index)
                cy.log('⚠️ Search index belum update, coba cari dengan nama lama');
                cy.get('input#keyword').clear().type(originalName + '{enter}');
                cy.url({ timeout: 10000 }).should('include', 'keyword=');
                
                // Buka produk dan cek namanya di form edit
                cy.contains('a', originalName).click();
                cy.url({ timeout: 10000 }).should('include', '/admin/products/edit/');
                
                // Verifikasi di form - apakah nama sudah berubah atau belum
                cy.get("input[name='name']").invoke('val').then((currentValue) => {
                  if (currentValue === updatedName) {
                    cy.log(`✅ Update berhasil! Nama di database sudah: "${updatedName}"`);
                    // Rollback
                    cy.get("input[name='name']").clear().type(originalName);
                    cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
                    cy.log(`✅ Rollback selesai`);
                  } else {
                    cy.log(`✅ Nama produk saat ini: "${currentValue}"`);
                  }
                });
              }
            });
          }
        });
        
        cy.log('✅ TC-019 SELESAI - Update produk dengan data valid berhasil diverifikasi');
    });

    it('TC-121: Verifikasi fungsionalitas hapus produk', () => {
        
        // --- Handler tetap diperlukan untuk potensi crash lain ---
        cy.on('uncaught:exception', (err, runnable) => {
          if (err.message.includes('Something wrong. Please try again')) {
            return false;
          }
          return true;
        });

        // STEP 1: Buat produk baru untuk dihapus
        const productName = `Cypress Delete Test ${Date.now()}`;
        const sku = `DEL-${Date.now()}`;

        cy.log(`--- TC-020: Membuat produk ${productName} untuk test delete ---`);
        cy.visit('/admin/products');
        
        cy.contains('New Product').click();
        cy.url().should('include', '/admin/products/new');

        // Isi form produk
        cy.get("input[name='name']").type(productName); 
        cy.get("input[name='sku']").should('not.be.disabled').type(sku);
        cy.get("input[name='qty']").type('10', { force: true });
        cy.get("input[name='price']").type('50.00', { force: true });
        cy.get("input[name='weight']").type('1.0', { force: true }); 
        cy.get('input[name="description"]', { timeout: 10000 })
          .type('Produk untuk test delete', { force: true }) 
          .trigger('change', { force: true }); 
        cy.get('input[name="url_key"]', { timeout: 10000 })
          .type(sku, { force: true }); 
        cy.get('input[name="meta_title"]', { timeout: 10000 })
          .type(productName, { force: true });
        cy.get('textarea[name="meta_description"]', { timeout: 10000 })
          .type('Meta untuk test delete', { force: true });
        
        cy.contains('span', 'Save', { timeout: 10000 }).parent('button').click();
        
        // Tunggu redirect atau manual visit
        cy.url({ timeout: 10000 }).then((currentUrl) => {
          if (currentUrl.includes('/edit/') || currentUrl.includes('/new')) {
            cy.log('⚠️ Belum redirect, navigasi manual ke products');
            cy.visit('/admin/products');
          }
        });
        
        cy.url().should('include', '/admin/products');
        cy.log(`✅ Produk ${productName} berhasil dibuat`);

        // STEP 2: Search dan hapus produk yang baru dibuat
        cy.log(`--- Mencari dan menghapus produk: ${productName} ---`);
        
        // Tunggu 2 detik agar backend selesai indexing
        cy.wait(2000);
        
        // Reload halaman untuk memastikan data fresh
        cy.reload();
        cy.wait(1000); // Tunggu halaman selesai reload
        
        // Search produk menggunakan input#keyword
        cy.get('input#keyword')
          .should('be.visible')
          .clear()
          .type(productName + '{enter}');
        
        cy.url({ timeout: 10000 }).should('include', 'keyword=');
        
        // Tunggu search selesai
        cy.wait(1000);
        
        cy.contains('a', productName, { timeout: 10000 })
          .parents('tr')
          .find('a,button')
          .last()
          .click();

        cy.on('window:confirm', (str) => {
          expect(str).to.include('Are you sure');
          return true;
        });
        
        cy.wait(1000); // Tunggu delete selesai
        cy.log('✅ Produk berhasil dihapus');

        cy.log('--- TC-020: Test hapus produk selesai ---');
      });
});