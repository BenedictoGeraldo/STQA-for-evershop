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
    // 1. CLEANUP
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);

    // 2. INTERCEPT
    cy.intercept('POST', '**/api/cart/*/items').as('addToCart');
    cy.intercept('POST', '**/coupons').as('applyCoupon');
    
    // Intercept GraphQL untuk checkout flow
    cy.intercept('POST', '**/api/graphql').as('graphqlOp');

    // 3. SETUP CART
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    
    // Tunggu cart ready
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
    
    cy.visit('/cart');
    cy.get('table.cart__items__table').should('be.visible');
  });

  // --- TC-006: Negative Coupon Test (PASS) ---
  it('TC-006: Validasi saat memasukkan kupon tidak valid', () => {
    cy.get('.summary__row.grand-total').children('div').last().invoke('text').then((initialTotalText) => {
        const initialTotal = parseFloat(initialTotalText.replace(/[^0-9.]/g, ''));
        
        // Input Invalid Coupon
        cy.get('input[name="coupon"]').clear().type(INVALID_COUPON);
        cy.contains('button', 'Apply').click();
        
        // Wait API Coupon
        cy.wait('@applyCoupon');
        
        // Validasi Error
        cy.get('body').then(($body) => {
           if ($body.find('.Toastify').length > 0) {
              cy.get('.Toastify').should('be.visible'); 
           } else {
              cy.contains(/invalid|not found/i).should('be.visible');
           }
        });

        // Validasi Harga TIDAK BERUBAH
        cy.get('.summary__row.grand-total').children('div').last().should(($div) => {
            const currentTotal = parseFloat($div.text().replace(/[^0-9.]/g, ''));
            expect(currentTotal).to.equal(initialTotal);
        });
    });
  });

  // --- TC-005: Positive Coupon Test (PASS) ---
  it('TC-005: User berhasil menggunakan kupon diskon valid', () => {
    cy.get('.summary__row.grand-total').children('div').last().invoke('text').then((initialTotalText) => {
        const initialTotal = parseFloat(initialTotalText.replace(/[^0-9.]/g, ''));
        
        // Input Valid Coupon
        cy.get('input[name="coupon"]').clear().type(VALID_COUPON);
        cy.contains('button', 'Apply').click();
        
        // Wait API Coupon 200 OK
        cy.wait('@applyCoupon').its('response.statusCode').should('eq', 200);
        
        // Tunggu UI update harga
        cy.wait(1000);

        // Logic validasi
        cy.get('.summary__row.grand-total').children('div').last().then(($div) => {
            const discountedTotal = parseFloat($div.text().replace(/[^0-9.]/g, ''));
            cy.log(`Initial: ${initialTotal}, Discounted: ${discountedTotal}`);
            expect(discountedTotal).to.be.lessThan(initialTotal);
        });
        
        // Validasi Feedback UI
        cy.get('body').should('contain', 'Coupon'); 
    });
  });

  // --- TC-007: Guest Checkout Full Flow (FIXED PLACE ORDER BUTTON) ---
  it('TC-007: Guest Checkout Full Flow (Isi Data -> Payment -> Success)', () => {
    
    // 1. Klik Checkout dari Cart
    cy.contains('a', 'CHECKOUT').should('be.visible').click();
    cy.url().should('include', '/checkout');

    // 2. ISI DATA GUEST
    cy.get('input[name="contact.email"]').should('be.visible').type(guestData.email);
    cy.get('input[name="shippingAddress.full_name"]').type(guestData.fullName);
    cy.get('input[name="shippingAddress.telephone"]').type(guestData.phone);
    cy.get('input[name="shippingAddress.address_1"]').type(guestData.address);
    cy.get('input[name="shippingAddress.city"]').type(guestData.city);
    cy.get('input[name="shippingAddress.postcode"]').type(guestData.postcode);
    
    cy.get('select[name="shippingAddress.country"]').select('ID'); 
    
    // Tunggu Provinsi Enable
    cy.get('select[name="shippingAddress.province"]')
      .should('not.be.disabled')
      .select('Jakarta Raya'); 

    // 3. PILIH SHIPPING METHOD (FORCE CHECK)
    cy.log('--- MEMILIH SHIPPING METHOD ---');
    cy.contains('Contoh Shipping', {timeout: 10000}).should('be.visible');

    cy.contains('Contoh Shipping').click({force: true});
    cy.contains('Contoh Shipping')
      .parents('.shipping-methods-list') 
      .find('input[type="radio"]')
      .first()
      .check({force: true}); 

    cy.wait('@graphqlOp');

    // 4. PILIH PAYMENT METHOD
    cy.log('--- MEMILIH PAYMENT METHOD ---');
    cy.contains('span', 'Cash On Delivery')
      .parents('.payment-methods-list')
      .find('input[type="radio"]')
      .first()
      .check({force: true});
      
    cy.wait('@graphqlOp');

    // 5. PLACE ORDER
    cy.log('--- KLIK PLACE ORDER ---');
    
    // [FIXED] Kembali gunakan selector teks 'Place Order'
    // Karena shipping & payment sudah dipilih, tombol sudah aktif dan teksnya benar.
    cy.get('button').contains('Place Order')
      .scrollIntoView()
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    // 6. VALIDASI SUKSES
    cy.url({timeout: 30000}).should('include', '/checkout/success');
    cy.get('body').should('contain', 'Thank you');
    cy.get('body').should('contain', guestData.email);
  });

});