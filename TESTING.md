# 📋 Testing Documentation - EverShop Project

Dokumentasi lengkap untuk menjalankan automated testing menggunakan Cypress pada proyek EverShop.

---

## 📑 Daftar Isi

- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Menjalankan Testing](#menjalankan-testing)
- [Struktur Test](#struktur-test)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prasyarat

Sebelum menjalankan testing, pastikan sistem Anda memiliki:

- **Node.js** versi 18 atau lebih tinggi
- **Docker** dan **Docker Compose** terinstall
- **Git** untuk clone repository
- **Browser** yang didukung (Chrome, Firefox, atau Edge)

Verifikasi instalasi dengan menjalankan:

```powershell
node --version
docker --version
docker-compose --version
```

---

## 📦 Instalasi

### 1. Clone Repository

```powershell
git clone https://github.com/BenedictoGeraldo/STQA-for-evershop.git
cd STQA-for-evershop
```

### 2. Install Dependencies

```powershell
npm install
```

Cypress akan terinstall otomatis sebagai bagian dari dev dependencies.

---

## 🚀 Menjalankan Aplikasi

Sebelum menjalankan test, aplikasi EverShop harus berjalan terlebih dahulu.

### Menggunakan Docker Compose (Recommended)

```powershell
# Start aplikasi dan database
docker-compose up -d

# Tunggu beberapa saat hingga aplikasi siap (biasanya 30-60 detik)
# Aplikasi akan berjalan di http://localhost:3000
```

### Verifikasi Aplikasi Berjalan

Buka browser dan akses:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

Jika halaman terbuka dengan baik, aplikasi sudah siap untuk di-test.

### Stop Aplikasi

```powershell
docker-compose down
```

---

## 🧪 Menjalankan Testing

### Mode Interactive (Cypress Test Runner)

Mode ini membuka GUI Cypress yang memungkinkan Anda memilih dan menjalankan test secara visual.

```powershell
npx cypress open
```

**Langkah-langkah:**
1. Pilih **E2E Testing**
2. Pilih browser yang ingin digunakan (Chrome/Firefox/Edge)
3. Klik **Start E2E Testing**
4. Pilih file test yang ingin dijalankan dari daftar

### Mode Headless (Command Line)

Mode ini menjalankan semua test secara otomatis tanpa membuka browser GUI (cocok untuk CI/CD).

```powershell
# Jalankan semua test
npx cypress run

# Jalankan test dengan browser spesifik
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge

# Jalankan test tertentu saja
npx cypress run --spec "cypress/e2e/admin-autentikasi-admin-katalog/**/*"
```

### Menjalankan Test Berdasarkan Kategori

#### 1. Test Admin - Autentikasi, Admin & Katalog
```powershell
npx cypress run --spec "cypress/e2e/admin-autentikasi-admin-katalog/**/*"
```

**Coverage:**
- Login admin
- Manajemen katalog produk
- CRUD operations produk

#### 2. Test Admin - Manajemen Penjualan & Pelanggan
```powershell
npx cypress run --spec "cypress/e2e/admin-manajemen-penjualanNpelanggan/**/*"
```

**Coverage:**
- Manajemen order
- Manajemen customer
- Sales reports

#### 3. Test Admin - Promosi & Laporan
```powershell
npx cypress run --spec "cypress/e2e/admin-promosi-laporan/**/*"
```

**Coverage:**
- Manajemen kupon dan promosi
- Laporan penjualan
- Analytics

#### 4. Test Customer - Autentikasi & Navigasi Produk
```powershell
npx cypress run --spec "cypress/e2e/cust-autentikasi-pelanggan-n-navigasi-produk/**/*"
```

**Coverage:**
- Register pelanggan
- Login pelanggan
- Browse produk
- Search & filter

#### 5. Test Customer - Keranjang & Panel Akun
```powershell
npx cypress run --spec "cypress/e2e/cust-keranjang-panel-akun-pelanggan/**/*"
```

**Coverage:**
- Add to cart
- Checkout process
- Profil pelanggan
- Order history

---

## 📂 Struktur Test

```
cypress/
├── e2e/                                              # Semua test end-to-end
│   ├── admin-autentikasi-admin-katalog/             # Test admin & katalog
│   │   ├── admin/                                    # Test fitur admin
│   │   ├── auth/                                     # Test autentikasi
│   │   └── catalog/                                  # Test katalog produk
│   ├── admin-manajemen-penjualanNpelanggan/         # Test sales & customer
│   ├── admin-promosi-laporan/                       # Test promosi & reports
│   ├── cust-autentikasi-pelanggan-n-navigasi-produk/ # Test customer auth
│   └── cust-keranjang-panel-akun-pelanggan/         # Test cart & account
├── fixtures/                                         # Data dummy untuk testing
│   └── example.json
├── screenshots/                                      # Screenshot saat test fail
├── support/                                          # Helper & commands
│   ├── commands.ts                                   # Custom commands
│   ├── e2e.ts                                        # Setup global
│   └── index.d.ts                                    # Type definitions
└── downloads/                                        # File yang didownload saat test
```

---

## 🎯 Konfigurasi Cypress

File konfigurasi utama: `cypress.config.ts`

**Konfigurasi default:**
- **Base URL**: `http://localhost:3000`
- **Browser**: Chrome (default), Firefox, Edge
- **Viewport**: 1280x720 (default)
- **Video Recording**: Enabled saat headless mode
- **Screenshot**: Otomatis saat test gagal

### Mengubah Base URL

Jika aplikasi berjalan di port berbeda, edit `cypress.config.ts`:

```typescript
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:XXXX",
    // ...
  },
});
```

---

## 📊 Melihat Test Results

### Test Reports

Setelah menjalankan `npx cypress run`, hasil test akan ditampilkan di terminal:

```
  Running:  1-products.cy.js                                           (1 of 10)

  Product Management Tests
    ✓ should display products list (2345ms)
    ✓ should create new product (3421ms)
    ✓ should edit product (2189ms)
    ✓ should delete product (1876ms)

  4 passing (9.8s)
```

### Screenshots & Videos

- **Screenshots** (saat test gagal): `cypress/screenshots/`
- **Videos** (rekaman test): `cypress/videos/`

---

## 🐛 Troubleshooting

### 1. Error: "Cannot connect to http://localhost:3000"

**Penyebab:** Aplikasi belum berjalan atau port berbeda.

**Solusi:**
```powershell
# Pastikan aplikasi berjalan
docker-compose up -d

# Cek aplikasi di browser
# Akses http://localhost:3000
```

### 2. Error: "getaddrinfo EAI_AGAIN database"

**Penyebab:** Container database belum siap saat app container start.

**Solusi:**
```powershell
# Stop semua container
docker-compose down

# Start ulang dengan build bersih
docker-compose up -d --build

# Tunggu 30-60 detik sebelum menjalankan test
```

### 3. Test Timeout atau Lambat

**Penyebab:** Aplikasi memerlukan waktu untuk load atau koneksi lambat.

**Solusi:** Tambahkan timeout di `cypress.config.ts`:
```typescript
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    defaultCommandTimeout: 10000, // 10 detik
    pageLoadTimeout: 60000, // 60 detik
  },
});
```

### 4. Cypress Tidak Terbuka (Windows)

**Penyebab:** Antivirus atau firewall memblokir.

**Solusi:**
```powershell
# Jalankan dengan verbose mode untuk debugging
npx cypress open --config-file cypress.config.ts

# Atau clear Cypress cache
npx cypress cache clear
npx cypress install
```

### 5. Database Connection Error

**Penyebab:** PostgreSQL container belum ready.

**Solusi:**
```powershell
# Cek status container
docker-compose ps

# Lihat logs database
docker-compose logs database

# Restart jika perlu
docker-compose restart database
```

---

## 🔄 Workflow Testing Lengkap

### Workflow 1: Testing dari Awal

```powershell
# 1. Clone dan setup
git clone https://github.com/BenedictoGeraldo/STQA-for-evershop.git
cd STQA-for-evershop
npm install

# 2. Start aplikasi
docker-compose up -d

# 3. Tunggu aplikasi ready (30-60 detik)
# Akses http://localhost:3000 untuk verifikasi

# 4. Jalankan test (pilih salah satu)
npx cypress open           # Mode interactive
npx cypress run            # Mode headless

# 5. Stop aplikasi setelah selesai
docker-compose down
```

### Workflow 2: Development & Testing

```powershell
# 1. Start aplikasi (jika belum)
docker-compose up -d

# 2. Jalankan Cypress interactive untuk development
npx cypress open

# 3. Pilih test yang ingin dijalankan
# 4. Edit test sesuai kebutuhan
# 5. Test akan auto-reload saat file disimpan

# 6. Setelah selesai development
docker-compose down
```

### Workflow 3: CI/CD Testing

```powershell
# Jalankan semua test headless dengan report
npx cypress run --browser chrome --headless

# Hasil test akan tersimpan di:
# - cypress/videos/
# - cypress/screenshots/ (jika ada yang gagal)
```

---

## 📝 Best Practices

1. **Selalu jalankan aplikasi terlebih dahulu** sebelum testing
2. **Gunakan mode interactive** untuk development dan debugging
3. **Gunakan mode headless** untuk CI/CD dan automated testing
4. **Bersihkan database** secara berkala untuk test yang konsisten
5. **Review screenshots dan videos** saat test gagal untuk debugging
6. **Isolasi setiap test** - test harus bisa berjalan independent
7. **Gunakan custom commands** untuk action yang sering diulang

---

## 🤝 Kontribusi

Jika menemukan bug atau ingin menambahkan test case:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/new-test`)
3. Tambahkan test case baru di folder yang sesuai
4. Commit changes (`git commit -m 'Add new test case'`)
5. Push ke branch (`git push origin feature/new-test`)
6. Buat Pull Request

---

## 📞 Support

Jika mengalami kesulitan:

- **Issues**: [GitHub Issues](https://github.com/BenedictoGeraldo/STQA-for-evershop/issues)
- **Documentation**: [Cypress Documentation](https://docs.cypress.io)
- **EverShop Docs**: [EverShop Documentation](https://evershop.io/docs)

---

## 📄 Lisensi

Project ini menggunakan lisensi GNU GENERAL PUBLIC LICENSE 3.0

---

**Happy Testing! 🎉**
