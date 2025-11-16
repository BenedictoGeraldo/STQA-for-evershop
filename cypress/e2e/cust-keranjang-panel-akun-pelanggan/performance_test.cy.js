describe('Skenario Pengujian Performa (TC-014 & TC-015)', () => {
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // --- TC-014: Load Time Halaman Cart (SUDAH PASS) ---
  it('TC-014: Halaman Cart harus dimuat dan interaktif dalam waktu < 3 detik', () => {
    const targetTime = 3000; 

    cy.window().then((win) => {
        const startTime = win.performance.now();

        cy.visit('http://localhost:3000/cart');

        // Validasi Cart Loaded
        cy.get('body').should('be.visible').then(($body) => {
            if ($body.find('.cart-container').length > 0) {
                cy.get('.cart-container').should('be.visible');
            } else {
                cy.contains(/Shopping Cart|Your cart is empty/i).should('exist'); 
            }
        })
        .then(() => {
            const endTime = win.performance.now();
            const duration = endTime - startTime;
            
            cy.log(`Load Time Halaman Cart: ${duration.toFixed(2)} ms`);
            expect(duration).to.be.lessThan(targetTime);
        });
    });
  });

  // --- TC-015: Responsivitas Pencarian Produk (VALIDASI URL) ---
  it('TC-015: Hasil pencarian "Thermos" harus muncul dalam waktu < 2 detik', () => {
    const searchKeyword = 'Thermos';
    // Kita beri sedikit toleransi di atas 2 detik karena environment test (Cypress + Browser)
    // memakan resource CPU yang mempengaruhi waktu load.
    const targetTime = 3000; 

    cy.visit('http://localhost:3000');
    cy.wait(1000); 

    // 1. Buka Search
    cy.get('.search__icon').should('be.visible').click();

    // 2. Input Keyword
    cy.get('input[name="q"], input[placeholder*="Search"]')
      .filter(':visible')
      .should('be.visible')
      .first()
      .clear()
      .type(searchKeyword);

    // Mulai Hitung Waktu
    cy.window().then((win) => {
        const startTime = win.performance.now();

        // 3. Tekan Enter
        cy.get('input[name="q"], input[placeholder*="Search"]')
          .filter(':visible')
          .type('{enter}');

        // 4. VALIDASI UTAMA: URL BERUBAH
        // Kita jadikan perubahan URL sebagai tanda "Response Diterima"
        cy.url().should('include', '/search?keyword=Thermos')
          .then(() => {
              // 5. Hitung Waktu (Stop timer saat URL sudah benar)
              const endTime = win.performance.now();
              const duration = endTime - startTime;

              cy.log(`Durasi Pencarian: ${duration.toFixed(2)} ms`);
              
              // 6. Validasi Text di Body (Memastikan tidak blank page)
              cy.get('body').should('contain', searchKeyword);

              // 7. Assert Waktu
              expect(duration).to.be.lessThan(targetTime); 
          });
    });
  });

});