# Sistem Informasi Survei Kepuasan Masyarakat (SKM) - Disperindag

Aplikasi Survei Kepuasan Masyarakat (SKM) berbasis web untuk evaluasi pelayanan Tera dan Tera Ulang pada Unit Pelaksana Teknis Metrologi Legal, Dinas Perdagangan dan Perindustrian.

Dibangun menggunakan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, dan **MySQL**.

---

## Fitur Utama

- **Halaman Publik (Masyarakat):**
  - Desain modern *Dark Minimalist Industrial* responsif (mobile-first untuk scan QR Code).
  - Formulir penilaian ringkas tanpa memungut data sensitif (tanpa NIK).
  - Skala evaluasi keramahan, kecepatan, transparansi biaya, dan kepuasan umum.
  - Kolom kritik dan saran terbuka.
  - Standar alur operasional prosedur (SOP) dan tanya jawab teknis komparasi.
- **Panel Administrator:**
  - URL login rahasia (*hidden secret entrance*).
  - Dashboard analitik KPI (Total Responden, Rasio Tera vs Tera Ulang, Nilai Indeks IKM).
  - Visualisasi grafik distribusi kepuasan masyarakat.
  - Tabel rekapitulasi data hasil survei dengan filter, pencarian, dan pagination.
  - Manajemen butir pertanyaan kuesioner dinamis (CRUD pertanyaan).
  - Ekspor laporan rekapitulasi ke format Excel (`.xlsx`).
  - Generator gambar QR Code loket siap unduh dan cetak.
  - Sidebar modular yang dapat diperluas dan diperkecil (*collapsible*).

---

## Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
- [Node.js](https://nodejs.org/) versi 18.x atau yang lebih baru.
- Layanan database **MySQL** (misalnya melalui XAMPP, Laragon, Docker, atau MySQL Server lokal).

### 2. Kloning Repository
```bash
git clone https://github.com/Ke-i30/Disperindag
cd Disperindag
```

### 3. Instalasi Dependencies
```bash
npm install
```

### 4. Konfigurasi Lingkungan (`.env`)
Salin file template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan kredensial database MySQL Anda di dalam file `.env.local`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=disperindag_skm
JWT_SECRET=buat_kunci_rahasia_acak_anda
```

### 5. Inisialisasi Basis Data & Akun Admin Default
Jalankan skrip migrasi database otomatis untuk membuat tabel, butir pertanyaan kuesioner awal, dan akun admin:
```bash
node scripts/init-db.mjs
node scripts/seed-admin.mjs
```

### 6. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada:
- **Halaman Depan (Survei Publik):** `http://localhost:3000`
- **Login Admin (URL Rahasia):** `http://localhost:3000/admin/kelola-loket-internal`

---

## Lisensi
Hak Cipta © 2026 Dinas Perdagangan dan Perindustrian.
