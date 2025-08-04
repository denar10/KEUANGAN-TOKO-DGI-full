# 💰 Keuangan Toko DGI

Aplikasi manajemen keuangan untuk Toko DGI dengan fitur lengkap untuk mencatat pemasukan, pengeluaran, dan membuat laporan keuangan.

## ✨ Fitur Utama

- 📊 **Dashboard** - Ringkasan keuangan dan informasi toko
- 💰 **Pemasukan** - Pencatatan pendapatan dari berbagai kategori
- 💸 **Pengeluaran** - Pencatatan biaya operasional dengan keterangan
- 📋 **Data Transaksi** - Daftar lengkap semua transaksi dengan fitur edit/hapus
- 📊 **Laporan** - Laporan keuangan lengkap dengan download format TXT
- 💾 **LocalStorage** - Data tersimpan otomatis di browser

## 🔒 Penyimpanan Data

Aplikasi menggunakan **localStorage** browser untuk menyimpan data:
- ✅ Data tersimpan otomatis setiap kali ada perubahan
- ✅ Data tetap ada meskipun browser ditutup
- ✅ Tidak memerlukan koneksi internet untuk menyimpan
- ✅ Data hanya tersimpan di browser pengguna (privasi terjaga)
- ✅ Kompatibel dengan deployment Vercel

### Catatan Penting localStorage:
- Data tersimpan di perangkat lokal pengguna
- Jika cache browser dihapus, data akan hilang
- Untuk backup, gunakan fitur "Download Laporan TXT"
- Data tidak tersinkron antar perangkat (setiap perangkat terpisah)

## 🏪 Kategori Bisnis

### Es Krim & Mainan 🍦🧸
- Penjualan es krim
- Penjualan mainan anak

### Gas ⛽
- Penjualan gas LPG 3kg
- Layanan terkait gas

## 🌐 DGI Hotspot Services

Aplikasi ini juga menampilkan layanan DGI Hotspot yang meliputi:

- Pulsa all operator
- Paket data/kuota
- Token listrik & tagihan listrik
- Top up game (Mobile Legend, Free Fire, PUBG, dll)
- Top up e-wallet (Dana, ShopeePay, GoPay, OVO)
- BPJS & PDAM
- Voucher WiFi
- Alat tulis & jas hujan

## 🚀 Deployment ke Vercel

### Langkah-langkah Deploy:

1. **Persiapkan Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   ```

2. **Push ke GitHub**
   ```bash
   # Buat repository baru di GitHub terlebih dahulu
   git remote add origin https://github.com/username/keuangan-toko-dgi.git
   git push -u origin main
   ```

3. **Deploy ke Vercel**
   - Kunjungi [vercel.com](https://vercel.com)
   - Login dengan akun GitHub
   - Klik "New Project"
   - Import repository GitHub Anda
   - Vercel akan otomatis mendeteksi sebagai React app
   - Klik "Deploy"

### ✅ LocalStorage di Vercel

LocalStorage akan bekerja normal di Vercel karena:
- Vercel men-deploy sebagai **Static Site** 
- JavaScript berjalan di **client-side** (browser)
- localStorage hanya tersedia di browser, bukan di server
- Kode sudah dilengkapi dengan pengecekan `typeof window !== 'undefined'`

### Konfigurasi Build (Otomatis)

Vercel akan otomatis:
- Menjalankan `npm install`
- Menjalankan `npm run build`
- Deploy hasil build ke CDN global

## 📱 Fitur Responsif

- Desain mobile-first
- Optimized untuk semua ukuran layar
- Touch-friendly interface
- Progressive Web App (PWA) ready

## 🎨 Teknologi

- **React 18** - Framework utama
- **Vanilla CSS** - Styling dengan gradien dan animasi
- **LocalStorage API** - Penyimpanan data persisten di browser
- **Responsive Design** - Mobile-friendly
- **PWA Support** - Installable di perangkat mobile

## 📊 Data Management

- **Persistent Storage**: Data tersimpan menggunakan localStorage
- **Auto-save**: Otomatis simpan setiap perubahan transaksi
- **Export Report**: Download laporan dalam format TXT
- **Edit/Delete**: Fitur lengkap manajemen transaksi
- **Safe Operations**: Pengecekan keamanan untuk mencegah data loss

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Test build locally
npm install -g serve
serve -s build
```

## 🛡️ Keamanan Data

- Data tersimpan lokal di browser pengguna (tidak di server)
- Tidak ada transmisi data sensitif ke server
- Privacy-first approach
- HTTPS otomatis di Vercel untuk keamanan koneksi

## 💡 Tips Penggunaan

1. **Backup Reguler**: Download laporan TXT secara berkala sebagai backup
2. **Multi-Device**: Install di setiap perangkat yang digunakan untuk pencatatan
3. **Browser Cache**: Jangan hapus cache browser agar data tidak hilang
4. **Update Browser**: Gunakan browser modern untuk performa optimal

## 📞 Kontak

**DGI Hotspot**
- 📍 Lokasi: Pilar, samping warung & laundry
- 📱 Telepon: 082218472975

## 📄 License

© 2024 Toko DGI. All rights reserved.

---

**Catatan**: Aplikasi ini menggunakan localStorage browser untuk penyimpanan data yang persisten dan aman, cocok untuk deployment di Vercel dengan performa optimal.
