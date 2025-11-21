describe('Skenario Pengujian Portabilitas (Mobile & Tablet)', () => {
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Mencegah error resize observer yang sering muncul saat ganti viewport
    cy.on('uncaught:exception', () => false);
  });

  // --- TC-020: Homepage Mobile (iPhone 6/7/8) ---
  it('TC-020: Tampilan Homepage responsif di layar Mobile (375x667)', () => {
    cy.viewport(375, 667); 
    cy.visit('/');

    // 1. Validasi Hamburger Menu (Selector Spesifik)
    // Berdasarkan HTML Evershop: <div class="md:hidden"><a ...><svg ...>
    // Kita cari elemen pembungkus menu mobile yang seharusnya visible
    cy.get('.header__middle__left .md\\:hidden svg')
      .should('be.visible', 'Hamburger menu icon harus terlihat di mobile');

    // 2. Validasi Menu Desktop Hilang (Penting!)
    // Di mobile, menu navigasi biasa (Home, Shop, dll) harusnya TIDAK MUNCUL
    // Selector menu desktop biasanya class "md:flex" atau sejenisnya
    cy.get('.header__middle__left ul.md\\:flex')
      .should('not.be.visible', 'Menu Desktop harus tersembunyi di mobile');

    // 3. Validasi Tidak Ada Horizontal Scroll (Fit to Screen)
    cy.window().then((win) => {
        const scrollWidth = win.document.documentElement.scrollWidth;
        const clientWidth = win.document.documentElement.clientWidth;
        
        // Scroll width harus sama dengan client width (toleransi 1-2px)
        expect(scrollWidth).to.be.closeTo(clientWidth, 2);
    });

    // 4. Validasi Grid Produk (Menjadi 1 atau 2 kolom)
    // Di desktop grid-cols-4, di mobile biasanya grid-cols-2 atau 1
    // Kita cek lebar kartu produk. Jika mobile, lebar kartu harusnya mendekati 50% atau 100% layar.
    cy.get('.product__list__item').first().invoke('outerWidth').then((cardWidth) => {
        expect(cardWidth).to.be.lessThan(375); // Pasti lebih kecil dari layar
        expect(cardWidth).to.be.gt(140); // Tapi tidak boleh terlalu kecil (penyok)
    });
  });

  // --- TC-021: Cart & Checkout Mobile (iPhone XR) ---
  it('TC-021: Tampilan Cart & Checkout responsif di layar Mobile (414x896)', () => {
    cy.viewport(414, 896); 
    
    // Gunakan Direct URL biar cepat
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    
    // Add to Cart
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000); // Wait animation

    // Validasi Halaman Cart
    cy.visit('/cart');
    
    // Pastikan Tabel Cart Responsive atau Stacked
    // Di Evershop mobile, biasanya tabel berubah tampilan.
    // Minimal kita cek tombol Checkout mudah diakses
    cy.contains('a', 'CHECKOUT').should('be.visible');

    // Validasi Halaman Checkout
    cy.visit('/checkout');
    
    // VALIDASI INPUT WIDTH (Responsive Check)
    cy.get('input[name="contact.email"]').should('be.visible')
      .invoke('outerWidth').then((inputWidth) => {
          // Lebar layar 414. Dikurang padding kiri kanan (misal 20px + 20px = 40px).
          // Input harusnya sekitar 374px. Kita set batas aman > 300px.
          cy.log(`Lebar Input Mobile: ${inputWidth}px`);
          expect(inputWidth).to.be.gt(300, 'Input field harus memenuhi lebar layar mobile');
      });
  });

  // --- TC-022: Detail Produk Tablet (iPad) - FIXED SELECTOR ---
  it('TC-022: Tampilan Detail Produk responsif di layar Tablet (768x1024)', () => {
    cy.viewport(768, 1024); 
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');

    // 1. Validasi Layout Gambar (FIXED)
    // Menggunakan class '.product-media-container' yang ada di HTML Anda
    cy.get('.product-media-container').should('be.visible'); 
    
    // Validasi spesifik gambar di dalamnya juga bagus
    cy.get('.product-image img').should('be.visible');

    // 2. Validasi Info Produk
    // Menggunakan class '.product__single__name' agar lebih spesifik daripada sekadar 'h1'
    cy.get('h1.product__single__name').should('contain', 'Thermos').and('be.visible');
    
    // 3. Validasi Menu Desktop MUNCUL (Tablet/Desktop Mode)
    // Di iPad Portrait (768px), Tailwind biasanya sudah masuk breakpoint 'md', 
    // jadi Hamburger hilang, Menu Desktop muncul.
    
    // Pastikan Hamburger HILANG
    cy.get('.header__middle__left .md\\:hidden svg')
      .should('not.be.visible', 'Hamburger menu harusnya hilang di Tablet 768px+');
      
    // Pastikan Layout Grid menjadi 2 Kolom (Gambar Kiri, Teks Kanan)
    // HTML Anda: <div class="grid grid-cols-1 gap-7 md:grid-cols-2">
    // Kita cek apakah class grid-cols-2 aktif secara style computed (agak kompleks) 
    // atau cek lebar container gambar tidak full width (artinya berbagi ruang).
    cy.get('.product-media-container').invoke('outerWidth').then((imgWidth) => {
        // Lebar layar 768. Jika layout 2 kolom, lebar gambar harusnya sekitar setengah (< 500px)
        // Jika layout mobile, lebar gambar mendekati 700px+
        expect(imgWidth).to.be.lt(700); 
    });
  });

});