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

    cy.window().then((win) => {
        // 1. Mulai Timer
        const startTime = win.performance.now();

        // 2. Buka Halaman Cart
        cy.visit('/cart');

        // 3. VALIDASI VISUAL (Finish Line)
        // Berdasarkan HTML Anda: <div class="empty-shopping-cart ...">
        // Kita tunggu sampai container ini visible
        cy.get('.empty-shopping-cart').should('be.visible');
        
        // Validasi Teks Spesifik
        // <span>Your cart is empty!</span>
        cy.contains('Your cart is empty!').should('be.visible');

        // Validasi Tombol "Continue Shopping" (Tanda interaktifitas)
        cy.contains('a', 'CONTINUE SHOPPING').should('be.visible')
          .then(() => {
            // 4. Stop Timer
            const endTime = win.performance.now();
            const duration = endTime - startTime;
            
            cy.log(`Load Time Cart (Empty): ${duration.toFixed(2)} ms`);
            
            // 5. Assertion Performance
            // Jika gagal (misal 4 detik), pesan error akan memberitahu durasi aslinya
            expect(duration, `Load time (${duration.toFixed(2)}ms) harus < ${targetTime}ms`)
              .to.be.lessThan(targetTime);
        });
    });
  });

  // --- TC-015: Responsivitas Pencarian Produk ---
  it('TC-015: Hasil pencarian "Thermos" harus me-render produk dalam waktu < 3 detik', () => {
    const searchKeyword = 'Thermos';
    // Toleransi waktu (Cypress overhead + Network)
    const targetTime = 3000; 

    cy.visit('/');
    cy.wait(1000); // Tunggu initial load selesai agar tidak mengganggu timer search

    // 1. Buka Search & Input Keyword
    cy.get('.search__icon').should('be.visible').click();
    
    // Selector input search standar Evershop
    cy.get('input[name="q"], input[placeholder*="Search"]')
      .filter(':visible')
      .first()
      .clear()
      .type(searchKeyword);

    // 2. Mulai Timer SEBELUM tekan Enter
    cy.window().then((win) => {
        const startTime = win.performance.now();

        // 3. Tekan Enter
        cy.get('input[name="q"], input[placeholder*="Search"]')
          .filter(':visible')
          .type('{enter}');

        // 4. VALIDASI RENDER (Finish Line yang Sebenarnya)
        // Jangan cuma cek URL. Cek apakah KARTU PRODUK sudah muncul?
        // Selector kartu produk: .product__list__item
        cy.get('.product__list__item')
          .should('have.length.at.least', 1) // Pastikan minimal ada 1 hasil
          .and('be.visible') // Pastikan terlihat mata
          .then(() => {
              const endTime = win.performance.now();
              const duration = endTime - startTime;

              cy.log(`Search Render Time: ${duration.toFixed(2)} ms`);
              
              // 5. Validasi Konten Relevan
              // Pastikan produk yang muncul mengandung kata kunci (Case Insensitive)
              cy.get('.product__list__item')
                .first()
                .invoke('text')
                .then((text) => {
                    expect(text.toLowerCase()).to.include(searchKeyword.toLowerCase());
                });

              // 6. Assert Waktu
              expect(duration, `Render search (${duration.toFixed(2)}ms) harus < ${targetTime}ms`)
                .to.be.lessThan(targetTime);
          });
    });
  });

});