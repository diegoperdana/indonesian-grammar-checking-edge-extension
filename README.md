# Pemeriksa Tata Bahasa Indonesia - Microsoft Edge Extension

Ekstensi Microsoft Edge untuk membantu pengguna Indonesia memperbaiki tata bahasa dalam dokumen online.

## Fitur

- ✅ Memindai teks di halaman web secara otomatis
- ✅ Menandai kesalahan tata bahasa dengan highlight
- ✅ Menampilkan pesan kesalahan saat hover/klik
- ✅ Mendukung berbagai jenis kesalahan:
  - Spasi ganda
  - Penggunaan kata ganda yang tidak perlu
  - Kesalahan preposisi (di, ke, dari)
  - Kapitalisasi nama tempat
  - Pengulangan kata yang tidak perlu
- ✅ Antarmuka popup yang mudah digunakan
- ✅ Ringkasan kesalahan yang ditemukan

## Instalasi

### Cara 1: Load Unpacked Extension (untuk pengembangan)

1. Buka Microsoft Edge
2. Ketik `edge://extensions/` di address bar
3. Aktifkan **Developer mode** (toggle di pojok kanan atas)
4. Klik **Load unpacked**
5. Pilih folder `indonesian-grammar-checker`
6. Ekstensi akan terpasang dan siap digunakan

### Cara 2: Package Extension (untuk distribusi)

1. Buka `edge://extensions/`
2. Aktifkan Developer mode
3. Klik **Pack extension**
4. Pilih folder `indonesian-grammar-checker`
5. File `.crx` akan dibuat untuk distribusi

## Penggunaan

1. **Aktifkan Ekstensi**
   - Klik ikon ekstensi di toolbar Edge
   - Toggle "Aktifkan Pemeriksa" untuk mengaktifkan/menonaktifkan

2. **Pindai Halaman**
   - Klik tombol "Pindai Halaman" di popup
   - Atau biarkan ekstensi memindai secara otomatis

3. **Lihat Kesalahan**
   - Teks dengan kesalahan akan di-highlight dengan warna kuning (peringatan) atau merah (kesalahan)
   - Klik pada teks yang di-highlight untuk melihat detail kesalahan
   - Banner ringkasan akan muncul di pojok kanan atas

4. **Hapus Highlight**
   - Klik tombol "Hapus Highlight" untuk menghapus semua tanda

## Struktur File

```
indonesian-grammar-checker/
├── manifest.json          # Konfigurasi ekstensi
├── content.js             # Script untuk memindai halaman
├── grammar-checker.js     # Logika pemeriksaan tata bahasa
├── popup.html             # Antarmuka popup
├── popup.js               # Script popup
├── background.js          # Service worker background
├── styles.css             # Styling untuk highlight dan tooltip
├── icons/                 # Folder untuk ikon ekstensi
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # Dokumentasi ini
```

## Membuat Ikon

Anda perlu membuat ikon untuk ekstensi. Buat file PNG dengan ukuran:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

Atau gunakan generator online seperti:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

Simpan file-file tersebut di folder `icons/`

## Pengembangan

### Menambahkan Aturan Tata Bahasa Baru

Edit file `grammar-checker.js` dan tambahkan aturan baru di method `initRules()`:

```javascript
{
    pattern: /regex-pattern/gi,
    message: "Pesan kesalahan",
    severity: "error" // atau "warning"
}
```

### Testing

1. Load extension di Edge (Developer mode)
2. Buka halaman web dengan teks Bahasa Indonesia
3. Klik ikon ekstensi dan aktifkan pemeriksa
4. Periksa apakah kesalahan terdeteksi dengan benar

## Catatan

- Ekstensi ini menggunakan pemeriksaan berbasis pola (pattern matching)
- Beberapa kesalahan mungkin memerlukan konteks lebih lanjut untuk deteksi yang akurat
- Untuk hasil terbaik, gunakan dengan teks formal Bahasa Indonesia
- Ekstensi ini tidak mengirim data ke server eksternal - semua pemrosesan dilakukan lokal

## Lisensi

Proyek ini dibuat untuk membantu pengguna Indonesia memperbaiki tata bahasa mereka.

## Kontribusi

Silakan buat issue atau pull request jika ingin menambahkan fitur atau memperbaiki bug.

## Versi

**v1.0.0** - Release awal dengan fitur dasar pemeriksaan tata bahasa.


