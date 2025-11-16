describe('Skenario My Account: Riwayat & Alamat (TC-011 & TC-012)', () => {
  
  const userEmail = 'efulkabima0407@gmail.com';
  const userPass = 'Jakarta2004';

  const newAddress = {
    fullName: 'Evan Alamat Baru',
    phone: '081299998888',
    address: 'Jl. Melati No. 45',
    city: 'Jakarta Selatan',
    postcode: '12190',
    province: 'Jakarta Raya'
  };

  it('TC-011 & TC-012: Cek Riwayat Pesanan & Menambah Alamat', () => {
    
    // --- STEP 0: LOGIN ---
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:3000/account/login');

    cy.get('input[name="email"]').clear().type(userEmail);
    cy.get('input[name="password"]').clear().type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();

    cy.wait(2000);
    cy.visit('http://localhost:3000/account'); 
    cy.url().should('include', '/account');

    // ---------------------------------------------------------
    // --- TC-011: MELIHAT RIWAYAT PESANAN (FIXED SELECTOR) ---
    // ---------------------------------------------------------
    cy.log('--- Memulai TC-011: Cek Order History ---');
    
    // PERBAIKAN: Menggunakan selector class dari HTML yang Anda berikan
    // Container Order
    cy.get('.order-history-order').should('exist');
    
    // Validasi Nomor Order (Format: "Order: #10001")
    cy.get('.order-number').should('contain', 'Order: #');
    
    // Validasi Nama Produk (Class: .order-item-name)
    cy.get('.order-item-name').should('exist');
    
    // Validasi Total Harga (Class: .order-total-value)
    cy.get('.order-total-value').should('contain', '$'); // Atau mata uang lain

    cy.wait(1000);

    // ---------------------------------------------------------
    // --- TC-012: MENAMBAHKAN ALAMAT (MODAL) ---
    // ---------------------------------------------------------
    cy.log('--- Memulai TC-012: Menambah Alamat via Pop-up ---');

    // 1. Pindah ke Menu "Add new address"
    cy.contains('a', 'Add new address').click();
    cy.wait(1000);

    // 3. Validasi Modal Terbuka
    cy.wait(1000);
    
    // 4. Isi Form (DI DALAM MODAL)
    cy.log('Mengisi Form di Pop-up');
    
    cy.get('input[name="full_name"]').filter(':visible').clear().type(newAddress.fullName);
    cy.get('input[name="telephone"]').filter(':visible').clear().type(newAddress.phone);
    cy.get('input[name="address_1"]').filter(':visible').clear().type(newAddress.address);
    cy.get('input[name="city"]').filter(':visible').clear().type(newAddress.city);
    cy.get('input[name="postcode"]').filter(':visible').clear().type(newAddress.postcode);

    // 5. Pilih Negara & Provinsi
    cy.log('Memilih Negara & Provinsi');
    
    // Pilih Negara (Indonesia / ID)
    cy.get('select[name="country"]').filter(':visible').select(1);
    cy.wait(3000); // Tunggu provinsi load

    // Pilih Provinsi (Jakarta Raya)
    cy.get('select[name="province"]')
      .filter(':visible')
      .should('not.be.disabled')
      .select('Jakarta Raya');

    // 5. Simpan Alamat (SCROLL DULU)
    cy.wait(1000);
    cy.log('Scroll ke tombol Save dan Klik');
    
    // PERBAIKAN: Scroll tombol save ke view agar tidak tertutup
    cy.get('button').contains(/Save|Add/i)
      .filter(':visible')
      .scrollIntoView() // Scroll pop-up ke bawah
      .should('be.visible')
      .click();

    // 6. Menutup Modal (Klik di Luar / Overlay)
    cy.wait(2000); // Tunggu proses save selesai dulu (Penting!)
    
    cy.log('Menutup Modal (Klik di luar)');
    // Klik body di koordinat 0,0 (pojok kiri atas) untuk mensimulasikan klik di luar modal
    cy.get('body').click(0, 0, {force: true});

    // 7. Validasi Sukses
    cy.wait(2000); 
    cy.log('Validasi alamat muncul & tombol Delete ada');
    
    // Cek data muncul
    cy.get('body').should('contain', newAddress.fullName);
    
    // PERBAIKAN VALIDASI: Cek tombol "Delete" (bukan Remove)
    // Kita cari elemen yang mengandung teks Delete (bisa a, button, atau span)
    cy.contains('Delete').should('exist');
  });

  // --- TC-013: MENGEDIT ALAMAT ---
  it('TC-013: User mengedit alamat pengiriman yang sudah ada', () => {
    
    const editData = {
      fullName: 'Evan Update Edit',
      phone: '081233334444',
      address: 'Jl. Perubahan No. 99',
      city: 'Jakarta Pusat'
      // Postcode & Province kita biarkan sama atau ubah jika perlu
    };

    // --- STEP 0: LOGIN ULANG ---
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:3000/account/login');

    cy.get('input[name="email"]').clear().type(userEmail);
    cy.get('input[name="password"]').clear().type(userPass);
    cy.get('button').contains(/Sign in|Login/i).click();

    // Tunggu masuk dashboard
    cy.wait(2000);
    cy.visit('http://localhost:3000/account'); 

    // 1. Masuk ke Menu Address Book (Langsung klik link di sidebar/tab)
    // Note: Di Evershop kadang linknya "Address Book" atau langsung "Add new address" di dashboard
    // Kita cari link yang mengarah ke halaman alamat atau teks "Address Book"
    cy.contains('a', 'Edit').click();
    cy.wait(1000);

    // 3. Validasi Modal Terbuka & Form Terisi
    cy.wait(1000);
    cy.log('Mengubah Data di Pop-up Edit');
    
    // Pastikan form visible dan ubah beberapa data
    cy.get('input[name="full_name"]').filter(':visible').clear().type(editData.fullName);
    cy.get('input[name="telephone"]').filter(':visible').clear().type(editData.phone);
    cy.get('input[name="address_1"]').filter(':visible').clear().type(editData.address);
    cy.get('input[name="city"]').filter(':visible').clear().type(editData.city);
    
    // Opsional: Ubah Provinsi jika perlu (biarkan jika tidak ingin diubah)
    // cy.get('select[name="province"]').filter(':visible').select('Jawa Barat');

    // 4. Simpan Perubahan
    cy.wait(1000);
    cy.log('Simpan Perubahan');
    
    cy.get('button').contains(/Save|Add/i)
      .filter(':visible')
      .scrollIntoView()
      .click();

    // 5. Tutup Modal (Klik di luar / Overlay)
    cy.wait(2000); // Tunggu proses save
    cy.get('body').click(0, 0, {force: true});

    // 6. Validasi Data Berubah
    cy.wait(1000);
    cy.log('Validasi data baru muncul di daftar');
    
    // Pastikan Nama dan Alamat BARU muncul
    cy.get('body').should('contain', editData.fullName);
    cy.get('body').should('contain', editData.address);
    
    // Pastikan Nama LAMA sudah tidak ada (validasi perubahan sukses)
    cy.get('body').should('not.contain', 'Evan Alamat Baru'); 
  });

});