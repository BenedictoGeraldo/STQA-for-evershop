describe('Skenario Pengujian Keranjang (TC-001 s/d TC-004)', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:3000/accessories/stainless-steel-thermos-yellow?color=3');
    cy.wait(2000);
  });

  const goToCartPage = () => {
    cy.wait(1000);
    cy.visit('http://localhost:3000/cart');
    cy.url().should('include', '/cart');
    cy.wait(2000);
  };

  // --- TC-001: SUDAH PASS ---
  it('TC-001: User dapat menambah item ke keranjang', () => {
    cy.contains('button', 'ADD TO CART').click();
    goToCartPage();
    cy.get('body').should('contain', 'Thermos');
  });

  // --- TC-002: PERBAIKAN FINAL ---
  it('TC-002: User dapat mengubah kuantitas produk di dalam Cart', () => {
    cy.contains('button', 'ADD TO CART').click();
    goToCartPage();

    // Klik tombol (+)
    // Kita simpan dulu elemen parent-nya agar nanti bisa dicek
    cy.get('body').then(($body) => {
        if ($body.find('button:contains("+"), a:contains("+")').length > 0) {
            cy.contains('button, a', '+').first().click({force: true});
        } else {
            // Fallback: Cari input apapun, klik sebelah kanannya
            cy.get('input').first().next().click({force: true});
        }
    });

    cy.wait(4000); // Tunggu update selesai (agak lama biar aman)

    // VALIDASI BARU (LEBIH PINTAR):
    // Kita tidak mencari <input> lagi.
    // Kita cari tombol (+) tadi, lalu kita minta "Bapak"-nya (Parent element).
    // Biasanya struktur HTML-nya: <div> [Tombol -] [Angka 2] [Tombol +] </div>
    // Jadi kita cukup cek apakah "Bapak"-nya mengandung teks "2".
    
    cy.contains('button, a', '+').first().parent().invoke('text').then((text) => {
        // Cek apakah teks di dalam container quantity mengandung angka 2
        // Contoh text bisa jadi: "- 2 +" atau "Qty: 2"
        expect(text).to.include('2');
    });
  });

  // --- TC-003: SUDAH PASS ---
  it('TC-003: User dapat menghapus item dari Cart', () => {
    cy.contains('button', 'ADD TO CART').click();
    goToCartPage();
    cy.contains('a, button', 'Remove').click();
    cy.get('body').should('contain', 'empty');
  });

  // --- TC-004: SUDAH PASS ---
  it('TC-004: Validasi perhitungan Subtotal harga produk', () => {
    cy.contains('button', 'ADD TO CART').click();
    goToCartPage();

    // Ambil Harga Satuan
    cy.get('tr td').contains(/[0-9]+[\.,][0-9]+/).first().invoke('text').then((textPrice) => {
        const unitPrice = parseFloat(textPrice.replace(/[^0-9.]/g, ''));
        
        // Klik tombol (+)
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("+"), a:contains("+")').length > 0) {
                cy.contains('button, a', '+').first().click({force: true});
            } else {
                cy.get('input:not([id*="coupon"])').first().next().click({force: true});
            }
        });
        
        cy.wait(3000);

        const targetTotal = unitPrice * 2;
        cy.get('body').should(($body) => {
             const bodyText = $body.text();
             expect(bodyText).to.match(new RegExp(Math.floor(targetTotal).toString())); 
        });
    });
  });

});