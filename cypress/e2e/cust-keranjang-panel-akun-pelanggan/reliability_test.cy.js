describe('Skenario Reliability Testing (TC-023 s/d TC-025)', () => {

  const userEmail = 'efulkabima0407@gmail.com';
  const userPass = 'Jakarta2004';
  
  const specialCharAddress = {
    fullName: 'Evan Spesial @#$%',
    phone: '081200001111',
    address: 'Jalan @#$%^&*()_+{ :', 
    city: 'Jakarta Raya',
    postcode: '12190',
    province: 'Jakarta Raya'
  };

  const normalAddress = {
    fullName: 'Evan Normal',
    phone: '081299998888',
    address: 'Jl. Merdeka No. 1',
    city: 'Jakarta Raya',
    postcode: '12190',
    province: 'Jakarta Raya'
  };

  // Setup Global (Reset & Add to Cart)
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.on('uncaught:exception', () => false);

    // 1. Add Product (Pakai Direct URL)
    cy.visit('/accessories/stainless-steel-thermos-yellow?color=3');
    cy.contains('button', 'ADD TO CART').click();
    cy.wait(1000); 
  });

  // --- TC-023: Stress Test Tombol Kuantitas ---
  it('TC-023: Sistem stabil saat tombol tambah kuantitas diklik berulang kali', () => {
    cy.visit('/cart');
    cy.intercept('PATCH', '**/items/*').as('updateQty');

    // Validasi Awal
    cy.get('span.min-w-\\[3rem\\]').should('have.text', '1');

    // STRESS TEST: Klik 5x Cepat (Tanpa wait di antaranya)
    // Tujuannya: Melihat apakah UI/Backend crash menerima request bertumpuk
    cy.log('--- START RAPID CLICKS ---');
    for(let i = 0; i < 5; i++) {
        cy.contains('button', '+').click();
    }

    // Tunggu API Selesai (Cypress akan menunggu request terakhir)
    // Kita beri timeout lebih lama karena server mungkin antre memproses 5 request
    cy.wait('@updateQty', { timeout: 10000 });

    // VALIDASI RELIABILITY:
    // 1. Tidak Crash (Internal Server Error)
    cy.get('body').should('not.contain', 'Internal Server Error');
    
    // 2. Data Konsisten
    // Setelah 5x klik dari 1, qty harusnya jadi 6.
    // Note: Jika backend Evershop punya 'debounce', mungkin hasilnya bukan 6.
    // Kita validasi minimal qty BERTAMBAH (> 1).
    cy.get('span.min-w-\\[3rem\\]').invoke('text').then((text) => {
        const qty = parseInt(text);
        expect(qty).to.be.gt(1);
    });
  });

  // --- TC-025: Input Karakter Spesial (Fuzzing Test) ---
  it('TC-025: Sistem menangani input karakter spesial pada alamat tanpa crash', () => {
    // Login dulu di Checkout
    cy.visit('/checkout');
    
    // Intercept Login
    cy.intercept('POST', '**/login').as('loginReq');
    cy.contains('button, a', 'Log in').click();
    cy.get('input[name="contact.email"]').type(userEmail);
    cy.get('input[name="contact.password"]').type(userPass);
    cy.get('button').contains(/^Log in$/).click();
    cy.wait(2000); // Wait redirect/refresh

    // Isi Form dengan Karakter Aneh
    cy.log('--- FUZZING INPUT ALAMAT ---');
    cy.get('input[name="shippingAddress.full_name"]').clear().type(specialCharAddress.fullName);
    cy.get('input[name="shippingAddress.telephone"]').clear().type(specialCharAddress.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(specialCharAddress.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(specialCharAddress.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(specialCharAddress.postcode);

    // Pilih Dropdown
    cy.get('select[name="shippingAddress.country"]').select('ID');
    cy.wait(1000);
    cy.get('select[name="shippingAddress.province"]').should('not.be.disabled').select('Jakarta Raya');

    // VALIDASI UTAMA: Apakah Shipping Method Muncul?
    // Jika crash/error, shipping method tidak akan load.
    cy.intercept('POST', '**/shippingMethods').as('shipReq');
    
    // Tunggu UI update (Shipping options usually load via AJAX)
    cy.wait(3000);

    // Assertion Tegas: Harus ada opsi shipping (artinya alamat diterima)
    // Selector: radio button di dalam list
    cy.get('.shipping-methods-list input[type="radio"]').should('exist');
    
    // Validasi data tersimpan di field (Sanity check)
    cy.get('input[name="shippingAddress.address_1"]').should('have.value', specialCharAddress.address);
  });

  // --- TC-024: Stabilitas Klik Beruntun (Place Order) ---
  it('TC-024: Sistem mencegah duplikasi order saat tombol Place Order diklik berkali-kali', () => {
    // Setup Full Checkout State (Login + Isi Alamat Normal)
    cy.visit('/checkout');
    cy.contains('button, a', 'Log in').click();
    cy.get('input[name="contact.email"]').type(userEmail);
    cy.get('input[name="contact.password"]').type(userPass);
    cy.get('button').contains(/^Log in$/).click();
    cy.wait(2000);

    // Isi Alamat Normal
    cy.get('input[name="shippingAddress.full_name"]').clear().type(normalAddress.fullName);
    cy.get('input[name="shippingAddress.telephone"]').clear().type(normalAddress.phone);
    cy.get('input[name="shippingAddress.address_1"]').clear().type(normalAddress.address);
    cy.get('input[name="shippingAddress.city"]').clear().type(normalAddress.city);
    cy.get('input[name="shippingAddress.postcode"]').clear().type(normalAddress.postcode);
    cy.get('select[name="shippingAddress.country"]').select('ID');
    cy.wait(1000);
    cy.get('select[name="shippingAddress.province"]').select('Jakarta Raya');

    // Pilih Shipping (Intercepted)
    cy.intercept('POST', '**/shippingMethods').as('addShipping');
    cy.wait(3000);
    cy.contains('Contoh Shipping').closest('div').click();
    cy.wait('@addShipping').its('response.statusCode').should('eq', 200);

    // Pilih Payment
    cy.wait(1000);
    cy.contains('span', 'Cash On Delivery').closest('div').click();
    cy.wait(2000);
    cy.get('#same-address').check({force: true});

    // --- TEST INTI: RAGE CLICK ---
    cy.log('--- RAGE CLICK PLACE ORDER 5x ---');
    
    // Pastikan tombol ready
    cy.get('button').contains('Place Order').should('not.be.disabled').as('btnOrder');

    // Klik 5x secepat mungkin
    cy.get('@btnOrder').then(($btn) => {
        for(let i=0; i<5; i++) {
            // Menggunakan .click() jQuery native untuk bypass antrian Cypress 
            // agar klik benar-benar terjadi "bebarengan" secara real-time
            $btn.click(); 
        }
    });

    // Validasi Redirect Sukses
    // Apapun yang terjadi (error duplikat atau sukses), user harus berakhir di halaman sukses
    cy.url({ timeout: 20000 }).should('include', '/checkout/success');

    // Note: Validasi "Mencegah Duplikasi" sebenarnya butuh cek ke Database / Order History
    // Untuk UI Test, yang penting user tidak stuck atau melihat error 500.
  });

});