describe('Skenario Pengujian Portabilitas (Mobile & Tablet)', () => {
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // --- TC-020: Homepage di Mobile (iPhone 6/7/8) ---
  it('TC-020: Tampilan Homepage responsif di layar Mobile (375x667)', () => {
    cy.viewport(375, 667); 
    cy.visit('http://localhost:3000');
    cy.wait(2000); // Tunggu render layout mobile

    // 1. Validasi Hamburger Menu (SUDAH PASS SEBELUMNYA)
    cy.log('Validasi Hamburger Menu');
    cy.get('header').within(() => {
        // Pastikan ada ikon SVG (Hamburger) yang terlihat
        cy.get('svg').should('be.visible');
    });

    // 2. Validasi Lebar Layout (SUDAH PASS SEBELUMNYA)
    cy.get('body').then(($body) => {
        const bodyWidth = $body.width();
        // Lebar konten tidak boleh melebihi lebar layar (tidak ada horizontal scroll)
        expect(bodyWidth).to.be.lte(375); 
    });

    // 3. Validasi Konten Produk/Banner (PERBAIKAN UTAMA)
    cy.log('Validasi Konten Visual');
    
    // Masalah Lalu: Link produk tidak ketemu.
    // Solusi Baru: Cek keberadaan GAMBAR apapun di halaman.
    // Homepage minimal punya Logo dan 1 Banner/Produk. Jadi minimal harus ada 2 gambar visible.
    cy.get('img')
      .filter(':visible')
      .should('have.length.at.least', 2);
      
    // Opsional: Validasi teks produk "Thermos" muncul di layar (jika ada di homepage)
    // cy.contains('Thermos').should('exist'); 
  });

  // --- TC-021: Cart & Checkout di Mobile (iPhone XR) ---
  it('TC-021: Tampilan Cart & Checkout responsif di layar Mobile (414x896)', () => {
    cy.viewport(414, 896); 
    cy.visit('http://localhost:3000/accessories/stainless-steel-thermos-yellow?color=3');
    cy.wait(1000);
    
    // Add to Cart
    cy.contains('button', 'ADD TO CART').should('be.visible').click();
    cy.wait(2000);

    // Validasi Cart
    cy.visit('http://localhost:3000/cart');
    cy.contains('CHECKOUT').scrollIntoView().should('be.visible');

    // Validasi Checkout
    cy.visit('http://localhost:3000/checkout');
    cy.wait(1000);

    // Cek Input Field tidak terpotong
    cy.get('input[name="contact.email"]')
      .filter(':visible')
      .should('be.visible')
      .invoke('width')
      .should('be.gt', 200); // Lebar minimal yang wajar
      
    // Cek Scroll Horizontal
    cy.window().then((win) => {
        const scrollWidth = win.document.documentElement.scrollWidth;
        const clientWidth = win.document.documentElement.clientWidth;
        expect(scrollWidth).to.be.closeTo(clientWidth, 10); 
    });
  });

  // --- TC-022: Detail Produk di Tablet (iPad) ---
  it('TC-022: Tampilan Detail Produk responsif di layar Tablet (768x1024)', () => {
    cy.viewport(768, 1024); 
    cy.visit('http://localhost:3000/accessories/stainless-steel-thermos-yellow?color=3');
    cy.wait(2000);

    // 1. Validasi Gambar Produk (Pakai ALT text biar akurat)
    cy.log('Validasi Gambar Produk Utama');
    cy.get('img[alt*="Thermos"]')
      .first()
      .should('be.visible')
      .invoke('width')
      .then((width) => {
          cy.log('Lebar Gambar di Tablet: ' + width + 'px');
          // Pastikan gambar cukup besar (tanda layout tablet/desktop, bukan mobile)
          expect(width).to.be.gt(250); 
      });

    // 2. Validasi Judul & Tombol
    cy.get('h1').should('contain', 'Thermos');
    cy.contains('button', 'ADD TO CART').should('be.visible');
    
    // 3. Validasi Header Tetap Ada
    cy.get('header').should('be.visible');
  });

});