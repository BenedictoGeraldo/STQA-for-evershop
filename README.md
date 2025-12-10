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

