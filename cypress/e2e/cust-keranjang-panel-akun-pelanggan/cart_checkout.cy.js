describe('Skenario Pengujian Keranjang (TC-001 s/d TC-004)', () => {

  // --- HELPER FUNCTION: Menambah Produk ke Cart ---
  const addProductToCart = (productName, variantColor) => {
    cy.visit('/');
    cy.contains('.product__list__item', productName).click();
    cy.url().should('include', '/accessories/'); 
    
    // Pilih Varian
    cy.get('.variant-option-list').contains('a', variantColor).click();
    
    // Klik Add to Cart
    cy.contains('button', 'ADD TO CART').click();
    
    // [FIXED] Tunggu API Add to Cart
    // Karena URL API bisa berubah (/mine/items atau /UUID/items), kita pakai wildcard di intercept
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
  };

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);

    // STATE CLEANUP
    cy.clearCookies();
    cy.clearLocalStorage();

    // [CRITICAL FIX] GENERALISASI INTERCEPT
    // Menggunakan wildcard (*) agar menangkap kedua jenis URL:
    // 1. /api/cart/mine/items (Item pertama)
    // 2. /api/cart/c302.../items (Item kedua dst)
    cy.intercept('POST', '**/api/cart/*/items').as('addToCart');
    
    // Intercept untuk update qty (biasanya method PUT atau PATCH ke /items/UUID)
    cy.intercept({ method: /PATCH|PUT|POST/, url: '**/items/*' }).as('updateQty');
  });

  // --- TC-001: Menambah Item ke Keranjang ---
  it('TC-001: User dapat menambah item ke keranjang', () => {
    addProductToCart('Stainless Steel Thermos', 'Yellow');

    // Paksa pindah ke halaman cart
    cy.visit('/cart');

    cy.get('table.cart__items__table').should('be.visible');
    cy.get('table.cart__items__table tbody tr')
      .contains('Stainless Steel Thermos')
      .should('be.visible');

    cy.get('table.cart__items__table tbody tr').first().within(() => {
      // Cek jumlah qty = 1
      cy.get('span').contains('1').should('be.visible');
    });
  });

  // --- TC-002: Mengubah Kuantitas Produk ---
  it('TC-002: User dapat mengubah kuantitas produk menggunakan tombol (+)', () => {
    addProductToCart('Stainless Steel Thermos', 'Yellow');
    cy.visit('/cart');

    cy.get('table.cart__items__table tbody tr').first().within(() => {
      cy.contains('button', '+').click();
      
      // Tunggu API Update
      cy.wait('@updateQty').its('response.statusCode').should('eq', 200);

      // Validasi UI jadi 2
      cy.get('span').contains('2').should('be.visible');
    });

    // Validasi Total Harga Berubah
    cy.get('table.cart__items__table tbody tr td').last().should(($td) => {
       const text = $td.text();
       expect(text).not.to.contain('$35.00'); 
       expect(text).to.contain('$70.00');     
    });
  });

  // --- TC-003: Menghapus Item dari Cart ---
  it('TC-003: User dapat menghapus item dari Cart', () => {
    addProductToCart('Stainless Steel Thermos', 'Yellow');
    cy.visit('/cart');

    cy.contains('a', 'Remove').click();

    // Validasi item hilang
    cy.get('body').then(($body) => {
      if ($body.find('table.cart__items__table').length > 0) {
        cy.contains('Stainless Steel Thermos').should('not.exist');
      } else {
        cy.contains('CONTINUE SHOPPING').should('be.visible');
      }
    });
  });

  // --- TC-004: Validasi Perhitungan Subtotal (FIXED) ---
  it('TC-004: Validasi perhitungan Subtotal harga (Multiple Products)', () => {
    // 1. Tambah 2 Produk
    addProductToCart('Stainless Steel Thermos', 'Yellow'); 
    // Sekarang intercept akan mengenali request kedua ini karena wildcard (*)
    addProductToCart('Modern Ceramic Vase', 'Green');    
    
    cy.visit('/cart');

    // 2. Ubah Qty Thermos jadi 2
    cy.contains('tr', 'Stainless Steel Thermos').within(() => {
        cy.contains('button', '+').click();
        cy.wait('@updateQty'); 
        cy.get('td').last().should('contain', '$70.00'); 
    });

    // 3. Hitung Manual vs UI
    let calculatedSum = 0;

    cy.get('table.cart__items__table tbody tr').each(($row) => {
        const lineTotalText = $row.find('td').last().text();
        const lineValue = parseFloat(lineTotalText.replace(/[^0-9.]/g, ''));
        calculatedSum += lineValue;
    }).then(() => {
        cy.get('.summary__row.grand-total').children('div').last().invoke('text').then((text) => {
            const uiTotal = parseFloat(text.replace(/[^0-9.]/g, ''));
            expect(uiTotal).to.equal(calculatedSum);
        });
    });
  });

});