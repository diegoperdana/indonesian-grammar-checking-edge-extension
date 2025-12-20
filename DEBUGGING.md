# Debugging Guide - Pemeriksa Tata Bahasa Indonesia

## Masalah yang Telah Diperbaiki

### 1. Error: IndonesianGrammarChecker is not defined
**Masalah:** Class grammar checker belum dimuat saat content script dijalankan.

**Solusi:**
- Menambahkan pengecekan dan retry mechanism
- Memastikan grammar-checker.js dimuat sebelum content.js (sudah diatur di manifest.json)
- Menambahkan error handling yang lebih baik

### 2. Error: document.body is null
**Masalah:** Script mencoba mengakses document.body sebelum DOM siap.

**Solusi:**
- Menambahkan pengecekan `document.body` sebelum menggunakan
- Menambahkan retry mechanism dengan setTimeout
- Setup observer hanya setelah DOM ready

### 3. Error: match.match() is not a function
**Masalah:** Mencoba memanggil `.match()` pada string yang sudah hasil match.

**Solusi:**
- Menghapus kode yang tidak diperlukan
- Memperbaiki logika pattern matching

### 4. Error saat scanning elemen
**Masalah:** Error tidak tertangani saat memindai elemen tertentu.

**Solusi:**
- Menambahkan try-catch di semua fungsi scanning
- Menambahkan error handling di setiap rule checking
- Menambahkan validasi sebelum memproses match

## Cara Debugging

### 1. Buka Developer Console
1. Buka halaman web di Edge
2. Tekan `F12` atau klik kanan → Inspect
3. Pilih tab **Console**

### 2. Cek Error Messages
Cari pesan error yang dimulai dengan:
- `IndonesianGrammarChecker is not defined`
- `Error scanning element:`
- `Error processing rule:`
- `Failed to load IndonesianGrammarChecker`

### 3. Test Manual di Console
Jalankan perintah berikut di console untuk test:

```javascript
// Cek apakah grammar checker tersedia
typeof IndonesianGrammarChecker

// Cek apakah content script sudah terpasang
document.querySelector('.igc-highlighted')

// Test grammar checker manual
const checker = new IndonesianGrammarChecker();
checker.checkText("saya sudah sudah pergi");
```

### 4. Cek Extension Status
1. Buka `edge://extensions/`
2. Cari ekstensi "Pemeriksa Tata Bahasa Indonesia"
3. Klik **Details**
4. Cek apakah ada error di bagian **Errors**

### 5. Reload Extension
Jika ada masalah:
1. Buka `edge://extensions/`
2. Klik tombol **Reload** pada ekstensi
3. Refresh halaman web yang sedang dibuka
4. Coba scan lagi

## Troubleshooting Umum

### Ekstensi tidak memindai halaman
**Penyebab:**
- Extension belum diaktifkan
- Content script belum terpasang
- Halaman menggunakan iframe (perlu permission khusus)

**Solusi:**
1. Pastikan toggle "Aktifkan Pemeriksa" aktif di popup
2. Klik tombol "Pindai Halaman" manual
3. Reload extension dan refresh halaman

### Highlight tidak muncul
**Penyebab:**
- Tidak ada kesalahan tata bahasa yang terdeteksi
- CSS tidak ter-load
- Element sudah di-modify oleh script lain

**Solusi:**
1. Test dengan teks yang jelas salah: "saya sudah sudah pergi"
2. Cek apakah file `styles.css` ter-load di DevTools → Network
3. Cek apakah ada conflict dengan CSS lain

### Error di console tapi ekstensi masih berfungsi
**Penyebab:**
- Warning dari rule yang tidak match
- Error handling sudah menangani error

**Solusi:**
- Error handling sudah menangani, ekstensi tetap berfungsi
- Jika mengganggu, bisa diabaikan atau dilaporkan untuk perbaikan

## Cara Melaporkan Bug

Jika menemukan bug baru:
1. Catat pesan error lengkap dari console
2. Catat langkah-langkah untuk reproduce
3. Screenshot jika perlu
4. Informasi browser: Edge version, OS version

## Testing Checklist

Setelah perbaikan, test hal berikut:
- [ ] Extension bisa di-load tanpa error
- [ ] Popup bisa dibuka
- [ ] Toggle on/off berfungsi
- [ ] Tombol "Pindai Halaman" berfungsi
- [ ] Highlight muncul pada teks dengan kesalahan
- [ ] Tooltip muncul saat klik highlight
- [ ] Summary banner muncul
- [ ] Tidak ada error di console
- [ ] Extension bekerja di berbagai halaman web


