describe('Skenario Cart Negative & Boundary (TC-026, TC-027, TC-028)', () => {

  // SETUP GLOBAL
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);

    // --- SETUP INTERCEPT ---
    cy.intercept('POST', '**/api/cart/*/items').as('addToCart');
    cy.intercept('PATCH', '**/api/cart/**/items/*').as('updateQty'); 
    cy.intercept('POST', '**/coupons').as('applyCoupon');
  });

  // --- TC-026: Boundary Test Stok ---
  it('TC-026: Validasi menambah Qty melebihi stok tersedia (Boundary Stok = 2)', () => {
    // 1. Setup: Buka Produk "Stok Tipis"
    cy.visit('/men/stoktipissepatu');

    // 2. Add to Cart
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);

    // 3. Masuk ke Cart
    cy.visit('/cart');
    cy.get('table.cart__items__table').should('be.visible');

    // 4. Validasi Qty Awal & Naikkan ke Max (2)
    cy.get('table.cart__items__table tbody tr').first().within(() => {
      // Validasi Qty = 1
      cy.get('span.min-w-\\[3rem\\]').should('be.visible');

      // ACTION: Naikkan ke 2
      cy.log('--- NAIKKAN QTY KE 2 (MAX STOK) ---');
      cy.contains('button', '+').click();
      
      cy.wait('@updateQty').its('response.statusCode').should('eq', 200);
      
      // Validasi Qty = 2
      cy.get('span.min-w-\\[3rem\\]').should('have.text', '2');
      
      // 5. TEST BOUNDARY: Coba Naikkan ke 3 (Melebihi Stok)
      cy.log('--- COBA NAIKKAN KE 3 (OVER STOK) ---');
      cy.contains('button', '+').click();
    });

    // Tunggu respons server
    cy.wait('@updateQty'); 

    // 6. EXPECTED RESULT: Validasi Pesan Error Inline
    cy.get('table.cart__items__table')
      .contains(/not have enough stock/i)
      .should('be.visible');
      
    cy.log('PASS: Sistem berhasil mencegah penambahan qty melebihi stok.');
  });

  // --- TC-027: Negative Test Min Qty (FIXED TRAVERSAL) ---
  it('TC-027: Validasi tombol Minus disabled saat Qty = 1 (Mencegah Qty 0)', () => {
    // 1. Setup
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
    
    cy.visit('/cart');

    // 2. Validasi Tombol Minus Disabled
    cy.get('table.cart__items__table tbody tr').first().within(() => {
       // [STRATEGI BARU]
       // 1. Cari Span Angka yang spesifik (berdasarkan class min-w-[3rem])
       // 2. Pindah ke saudara sebelah kirinya (.prev()) -> Itulah tombol minus
       cy.get('span.min-w-\\[3rem\\]')
         .should('have.text', '1') // Pastikan angkanya 1
         .prev('button')           // Ambil elemen button tepat sebelum span ini
         .should('be.disabled');   // Assert disabled
    });
    
    cy.log('PASS: Sistem mencegah user mengurangi qty jika sudah 1');
  });

  // --- TC-028: Negative Test Kupon Expired ---
  it('TC-028: Validasi penggunaan Kupon Kadaluarsa (Negative)', () => {
    const EXPIRED_COUPON = 'EXPIRED123'; 

    // 1. Setup
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
    
    cy.visit('/cart');

    // 2. Simpan Harga Awal
    cy.get('.summary__row.grand-total').children('div').last().invoke('text').then((initialText) => {
        const initialPrice = parseFloat(initialText.replace(/[^0-9.]/g, ''));
        
        // 3. Input Kupon Expired
        cy.get('input[name="coupon"]')
          .should('be.visible')
          .clear()
          .type(EXPIRED_COUPON);
          
        cy.contains('button', 'Apply').click();

        cy.wait('@applyCoupon');

        // 4. Validasi Error Message
        cy.get('body').then(($body) => {
            if ($body.find('.Toastify').length > 0) {
                cy.get('.Toastify').should('be.visible');
            } else {
                cy.contains(/invalid|expired/i).should('be.visible');
            }
        });
        
        // 5. Validasi Harga TIDAK BERUBAH
        cy.get('.summary__row.grand-total').children('div').last().invoke('text').then((newText) => {
            const currentPrice = parseFloat(newText.replace(/[^0-9.]/g, ''));
            expect(currentPrice, 'Harga tidak boleh berubah jika kupon expired')
                .to.equal(initialPrice);
        });
    });
  });

});