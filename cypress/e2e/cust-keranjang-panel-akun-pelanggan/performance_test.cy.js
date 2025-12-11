describe('Skenario Pengujian Performa (TC-014 & TC-015)', () => {
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Handle internal app errors agar tes tidak stop tiba-tiba
    cy.on('uncaught:exception', () => false);
  });

  // --- TC-014: Load Time Halaman Cart (Empty State) ---
  it('TC-014: Halaman Cart (Kosong) harus dimuat dan interaktif dalam waktu < 3 detik', () => {
    // Target waktu (ms)
    const targetTime = 3000; 
    let startTime;

    // 1. Mulai Timer (Gunakan Date.now() agar aman saat ganti halaman)
    cy.then(() => {
        startTime = Date.now();
    });

    // 2. Buka Halaman Cart
    cy.visit('/cart');

    // 3. VALIDASI VISUAL (Finish Line)
    // Tunggu elemen empty cart muncul
    cy.get('.empty-shopping-cart').should('be.visible');
    
    // Validasi Teks
    cy.contains('Your cart is empty!').should('be.visible');

    // Validasi Tombol (Interaktifitas)
    cy.contains('a', 'CONTINUE SHOPPING').should('be.visible')
      .then(() => {
        // 4. Stop Timer
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        cy.log(`Load Time Cart (Empty): ${duration} ms`);
        
        // 5. Assertion Performance
        expect(duration, `Load time (${duration}ms) harus < ${targetTime}ms`)
          .to.be.lessThan(targetTime);
      });
  });

  // --- TC-015: Responsivitas Pencarian Produk ---
  it('TC-015: Hasil pencarian "Thermos" harus me-render produk dalam waktu < 3 detik', () => {
    const searchKeyword = 'Thermos';
    const targetTime = 3000; 
    let startTime;

    // Setup awal (Visit Home dulu)
    cy.visit('/');
    
    // 1. Buka Search & Input Keyword
    cy.get('.search__icon').should('be.visible').click();
    
    // Selector input search yang robust (Visible only)
    cy.get('input[placeholder*="Search"]')
      .filter(':visible')
      .first()
      .clear()
      .type(searchKeyword);

    // 2. Mulai Timer SEBELUM tekan Enter
    cy.then(() => {
        startTime = Date.now();
    });

    // 3. Tekan Enter (Memicu Page Reload / Search Request)
    cy.get('input[placeholder*="Search"]')
      .filter(':visible')
      .first()
      .type('{enter}');

    // 4. VALIDASI RENDER (Finish Line)
    // Tunggu minimal 1 produk muncul
    cy.get('.product__list__item')
      .should('have.length.at.least', 1) 
      .and('be.visible')
      .then(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          cy.log(`Search Render Time: ${duration} ms`);
          
          // 5. Validasi Konten Relevan
          cy.get('.product__list__item')
            .first()
            .invoke('text')
            .then((text) => {
                expect(text.toLowerCase()).to.include(searchKeyword.toLowerCase());
            });

          // 6. Assert Waktu
          expect(duration, `Render search (${duration}ms) harus < ${targetTime}ms`)
            .to.be.lessThan(targetTime);
      });
  });

});