# 💰 Keuangan Toko DGI

Aplikasi manajemen keuangan untuk Toko DGI dengan fitur lengkap untuk mencatat pemasukan, pengeluaran, dan membuat laporan keuangan.

## ✨ Fitur Utama

- 📊 **Dashboard** - Ringkasan keuangan dan informasi toko
- 💰 **Pemasukan** - Pencatatan pendapatan dari berbagai kategori
- 💸 **Pengeluaran** - Pencatatan biaya operasional dengan keterangan
- 📋 **Data Transaksi** - Daftar lengkap semua transaksi dengan fitur edit/hapus
- 📊 **Laporan** - Laporan keuangan lengkap dengan download format TXT

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
- **Local State Management** - Data tersimpan dalam session memori
- **Responsive Design** - Mobile-friendly
- **PWA Support** - Installable di perangkat mobile

## 📊 Data Management

- Data tersimpan dalam memori session (tidak persisten)
- Export laporan dalam format TXT
- Fitur edit dan hapus transaksi
- Perhitungan otomatis keuntungan/kerugian

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

## 📞 Kontak

**DGI Hotspot**
- 📍 Lokasi: Pilar, samping warung & laundry
- 📱 Telepon: 082218472975

## 📄 License

© 2024 Toko DGI. All rights reserved.

---

**Catatan**: Aplikasi ini dioptimalkan untuk deployment di Vercel dengan konfigurasi build otomatis dan routing SPA.