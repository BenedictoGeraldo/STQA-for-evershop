describe('Skenario Diskon dan Proses Checkout (TC-005 s/d TC-007)', () => {
  
  const VALID_COUPON = 'DISKON10'; 
  const INVALID_COUPON = 'KUPONPALSU123';
  
  const guestData = {
    email: 'guest_test@example.com',
    fullName: 'Guest User',
    phone: '081299998888',
    address: 'Jl. Tamu Tak Diundang No. 99',
    city: 'Jakarta Selatan',
    postcode: '12000'
  };

  beforeEach(() => {
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.on('uncaught:exception', () => false); 

    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000); 
    cy.visit('/cart');
    
    cy.get('table.cart__items__table').should('be.visible');
    cy.get('.cart-summary').should('be.visible');
  });

  // --- TC-006: Negative Coupon Test ---
  it('TC-006: Validasi saat memasukkan kupon tidak valid', () => {
    cy.intercept('POST', '**/coupons').as('applyCoupon');
    cy.get('.summary__row.grand-total').children('div').last().invoke('text').then((initialTotalText) => {
        const initialTotal = parseFloat(initialTotalText.replace(/[^0-9.]/g, ''));
        cy.get('input[name="coupon"]').clear().type(INVALID_COUPON);
        cy.contains('button', 'Apply').click();
        cy.wait('@applyCoupon');
        cy.get('.Toastify').should('exist'); 
        cy.get('.summary__row.grand-total').children('div').last().should(($div) => {
            const currentTotal = parseFloat($div.text().replace(/[^0-9.]/g, ''));
            expect(currentTotal).to.equal(initialTotal);
        });
    });
  });

  // --- TC-005: Positive Coupon Test ---
  it('TC-005: User berhasil menggunakan kupon diskon valid', () => {
    cy.intercept('POST', '**/coupons').as('applyCoupon');
    cy.get('.summary__row.grand-total').children('div').last().invoke('text').then((initialTotalText) => {
        const initialTotal = parseFloat(initialTotalText.replace(/[^0-9.]/g, ''));
        cy.get('input[name="coupon"]').clear().type(VALID_COUPON);
        cy.contains('button', 'Apply').click();
        cy.wait('@applyCoupon').its('response.statusCode').should('eq', 200);
        cy.get('.summary__row.grand-total').children('div').last().should(($div) => {
            const discountedTotal = parseFloat($div.text().replace(/[^0-9.]/g, ''));
            expect(discountedTotal).to.be.lessThan(initialTotal);
        });
        cy.get('.Toastify').should('contain', 'Coupon'); 
    });
  });

  // --- TC-007: Guest Checkout Full Flow (FIXED: Single Element Click) ---
  it('TC-007: Guest Checkout Full Flow (Isi Data -> Payment -> Success)', () => {
    // Setup Intercept (Wajib)
    cy.intercept('POST', '**/shippingMethods').as('addShipping');
    
    // 1. Klik Checkout
    cy.contains('a', 'CHECKOUT').should('be.visible').click();
    cy.url().should('include', '/checkout');

    // 2. ISI DATA
    cy.get('#field-contact\\.email').should('be.visible').type(guestData.email);
    cy.get('#field-shippingAddress\\.full_name').type(guestData.fullName);
    cy.get('#field-shippingAddress\\.telephone').type(guestData.phone);
    cy.get('#field-shippingAddress\\.address_1').type(guestData.address);
    cy.get('#field-shippingAddress\\.city').type(guestData.city);
    cy.get('#field-shippingAddress\\.postcode').type(guestData.postcode);
    cy.get('#field-shippingAddress\\.country').select('ID'); 
    cy.wait(1000); 
    cy.get('#field-shippingAddress\\.province').should('not.be.disabled').select('Jakarta Raya'); 

    // 3. PILIH SHIPPING METHOD (FIXED ERROR)
    cy.log('--- MEMILIH SHIPPING METHOD ---');
    cy.wait(3000); // Tunggu opsi render
    
    // [PERBAIKAN UTAMA DI SINI]
    // Gunakan .closest('div') untuk mengambil HANYA SATU pembungkus terdekat
    // Jangan gunakan .parents() karena mengambil banyak elemen
    cy.contains('Contoh Shipping')
      .closest('div') 
      .click(); 

    // Tunggu server menyimpan pilihan (Mencegah uncheck otomatis)
    cy.wait('@addShipping').its('response.statusCode').should('eq', 200);
    
    // 4. PILIH PAYMENT METHOD
    cy.log('--- MEMILIH PAYMENT METHOD ---');
    cy.wait(1000);
    cy.contains('span', 'Cash On Delivery').click(); 
    cy.wait(2000); // Tunggu payment tersimpan

    // 5. BILLING ADDRESS
    cy.get('#same-address').check({force: true});

    // 6. PLACE ORDER
    cy.log('--- KLIK PLACE ORDER ---');
    cy.wait(2000); 

    cy.get('.checkout-button-section button')
      .should('not.be.disabled')
      .click();

    // 7. VALIDASI SUKSES
    cy.url({timeout: 30000}).should('include', '/checkout/success');
    cy.get('body').should('contain', 'Thank you');
    cy.get('body').should('contain', guestData.email);
  });

});