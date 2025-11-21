describe('Skenario Pengujian Keranjang (TC-001 s/d TC-004)', () => {

  beforeEach(() => {
    // Menangani exception internal aplikasi agar tes tidak berhenti
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });

    // Setup spy/listener untuk API Add to Cart
    cy.intercept('POST', '**/cart/add').as('addToCart');

    // 1. Buka Halaman Utama
    cy.visit('/');

    // 2. Cari produk "Stainless Steel Thermos" di grid dan klik
    // Menggunakan selector spesifik dari HTML homepage yang Anda berikan
    cy.get('.product__list__item')
      .contains('.product__list__name', 'Stainless Steel Thermos')
      .first() // Mengambil yang pertama jika ada banyak varian di home
      .click();

    // 3. Validasi sudah masuk halaman detail produk
    cy.url().should('include', '/accessories/');

    // 4. Pilih Varian Warna (Yellow)
    // Menggunakan selector dari HTML variant list yang Anda berikan
    cy.get('.variant-option-list')
      .contains('a', 'Yellow')
      .click();

    // 5. Tunggu sebentar untuk memastikan state warna terpilih (opsional safety)
    cy.wait(500); 
  });

  it('TC-001: User dapat menambah item ke keranjang', () => {
    // Klik tombol Add to Cart
    cy.contains('button', 'ADD TO CART').click();

    // Tunggu respons server atau fallback wait
    cy.wait(1000);

    // Navigasi ke halaman Cart
    cy.visit('/cart');

    // Validasi Tabel Cart muncul
    cy.get('table.cart__items__table').should('be.visible');

    // Validasi Item yang ditambahkan ada di dalam tabel
    cy.get('table.cart__items__table tbody tr')
      .contains('Stainless Steel Thermos')
      .should('be.visible');

    // Validasi Default Quantity adalah 1
    cy.get('table.cart__items__table tbody tr').first().within(() => {
      cy.get('span.min-w-\\[3rem\\]').should('have.text', '1');
    });
  });

  it('TC-002: User dapat mengubah kuantitas produk menggunakan tombol (+)', () => {
    // Precondition: Tambah item ke cart
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000);
    cy.visit('/cart');

    // Fokus pada baris produk pertama
    cy.get('table.cart__items__table tbody tr').first().within(() => {
      // Pastikan qty awal 1
      cy.get('span.min-w-\\[3rem\\]').should('have.text', '1');

      // Klik tombol (+)
      cy.contains('button', '+').click();

      // Validasi qty berubah menjadi 2 (Explicit Wait)
      cy.get('span.min-w-\\[3rem\\]').should('have.text', '2');
    });

    // Validasi Total Harga berubah di kolom total
    cy.wait(1000); // Tunggu kalkulasi backend
    cy.get('table.cart__items__table tbody tr td').last().invoke('text').then((text) => {
      // Pastikan format harga tidak sama dengan harga satuan awal ($35.00)
      expect(text).to.not.contain('$35.00');
    });
  });

  it('TC-003: User dapat menghapus item dari Cart', () => {
    // Precondition: Tambah item ke cart
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000);
    cy.visit('/cart');

    // Klik tombol Remove
    cy.contains('a', 'Remove').click();

    // Validasi item hilang dari DOM atau pesan kosong muncul
    cy.get('body').then(($body) => {
      if ($body.find('table.cart__items__table').length > 0) {
        cy.contains('Stainless Steel Thermos').should('not.exist');
      } else {
        cy.get('body').should('contain', 'empty');
      }
    });
  });

  it('TC-004: Validasi perhitungan Subtotal harga (Multiple Products)', () => {
    // --- STEP 1: Tambah Produk Pertama (Thermos) ---
    cy.visit('/');
    cy.contains('.product__list__item', 'Stainless Steel Thermos').click();
    cy.get('.variant-option-list').contains('a', 'Yellow').click();
    cy.wait(500);
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000);

    // --- STEP 2: Tambah Produk Kedua (Ceramic Vase) ---
    cy.visit('/'); 
    cy.contains('.product__list__item', 'Modern Ceramic Vase').click();
    // Pilih varian warna (Green)
    cy.get('.variant-option-list').contains('a', 'Green').click();
    cy.wait(500); 
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000);

    // --- STEP 3: Masuk ke Cart ---
    cy.visit('/cart');
    cy.intercept('PATCH', '**/items/*').as('updateQty');

    // --- STEP 4: Ubah Quantity Thermos jadi 2 & VALIDASI VISUAL ---
    cy.contains('tr', 'Stainless Steel Thermos').within(() => {
        cy.contains('button', '+').click();
        // Validasi Qty jadi 2
        cy.get('span.min-w-\\[3rem\\]').should('have.text', '2');
        
        // [PERBAIKAN KRUSIAL] 
        // Tunggu sampai kolom TOTAL di baris ini berubah jadi $70.00
        // Ini mencegah Cypress menghitung saat angkanya masih $35.00
        cy.get('td').last().should('contain', '$70.00');
    });

    // Tunggu network (safety tambahan)
    cy.wait('@updateQty');

    // --- STEP 5: Validasi Perhitungan Total ---
    let calculatedSum = 0;

    cy.get('table.cart__items__table tbody tr').each(($row) => {
        // Ambil teks total dari kolom terakhir
        const lineTotalText = $row.find('td').last().text();
        const lineValue = parseFloat(lineTotalText.replace(/[^0-9.]/g, ''));
        
        calculatedSum += lineValue;
    }).then(() => {
        cy.log(`Total Hasil Hitung: ${calculatedSum}`); // Seharusnya 95

        // [PERBAIKAN SELECTOR]
        // Gunakan .children('div').last() untuk mengambil container kanan
        // Selector lama .find('div').last() mengambil div kosong di dalam container itu
        cy.get('.summary__row.grand-total').children('div').last().should(($div) => {
            const text = $div.text(); // Mengambil "$95.00"
            const grandTotalValue = parseFloat(text.replace(/[^0-9.]/g, ''));

            expect(grandTotalValue, `Total di UI ($${grandTotalValue}) harus sama dengan hitungan ($${calculatedSum})`)
                .to.equal(calculatedSum);
        });
    });
  });

});