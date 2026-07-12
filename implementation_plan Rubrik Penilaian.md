# Rencana Implementasi: Integrasi Rubrik Penilaian CT 4 Pilar secara Objektif, Transparan, & Interaktif

Penyesuaian instrumen penilaian proyek di WebCraft dengan proposal menggunakan 4 pilar Computational Thinking (CT) — Dekomposisi, Pengenalan Pola, Abstraksi, dan Algoritma (Tabel 3 & Tabel 5) — untuk guru (validasi manual & AI Assessment) dan siswa (pemandu belajar mandiri).

## User Review Required

> [!IMPORTANT]
> **Skema Penilaian & Pembobotan**:
> Default rubrik baru diubah dari kriteria umum (Kelengkapan, Semantik, Desain) menjadi 4 Pilar CT (Dekomposisi, Pengenalan Pola, Abstraksi, Algoritma) masing-masing berbobot **25%** untuk memastikan paritas penilaian objektif.
>
> **Konversi Skor Manual & AI (Skala 1-4 ke 0-100)**:
> Guru/AI dapat menilai dalam skala 0-100, di mana visual sistem akan menampilkan deskripsi kriteria yang sesuai secara dinamis:
> - **Skor 4 (90 - 100)**: Sangat Baik (Tuntas)
> - **Skor 3 (75 - 89)**: Baik (Tuntas)
> - **Skor 2 (60 - 74)**: Cukup (Perlu Bimbingan)
> - **Skor 1 (< 60)**: Kurang (Perlu Bimbingan)

---

## Proposed Changes

### 1. Komponen Baru Rubrik

#### [NEW] [CTRubricGuide.jsx](file:///d:/UNNES/Lomba/LIDM%202026/WebCraft/src/components/ct-rubric/CTRubricGuide.jsx)
Membuat satu file modular penampung data kriteria penilaian Tabel 5 serta komponen `<CTRubricPanel />` yang dapat dipasang di berbagai halaman dengan visual Neo-Brutalist.

### 2. Modul Guru (Penilaian Manual & AI)

#### [MODIFY] [GaleriKarya.jsx](file:///d:/UNNES/Lomba/LIDM%202026/WebCraft/src/views/GaleriKarya.jsx)
- Menampilkan deskripsi rubrik aktif secara dinamis saat guru menyeret slider nilai.
- Menambahkan tombol klik cepat (Skor 1-4) di bawah slider kriteria untuk memudahkan guru.
- Menampilkan rincian skor rubrik breakdown dan kriteria deskriptif di halaman portofolio siswa ("Karya Saya") agar transparan.

#### [MODIFY] [route.ts (pertemuan)](file:///d:/UNNES/Lomba/LIDM%202026/WebCraft/src/app/api/rooms/[roomId]/pertemuan/route.ts)
Mengubah template default `rubrik_json` saat pembuatan pertemuan baru oleh guru agar mengacu pada 4 pilar CT.

#### [MODIFY] [seed.ts](file:///d:/UNNES/Lomba/LIDM%202026/WebCraft/src/db/seed.ts)
Mengubah seed awal `proj-1` menggunakan rubrik 4 pilar CT.

### 3. Modul Siswa (Pemandu Belajar)

#### [MODIFY] [TugasDetail.jsx](file:///d:/UNNES/Lomba/LIDM%202026/WebCraft/src/views/TugasDetail.jsx)
Menambahkan tab/akordeon "Panduan Rubrik Penilaian CT" pada langkah **Action** sebelum siswa memulai pengerjaan kode.

#### [MODIFY] [Workspace.jsx](file:///d:/UNNES/Lomba/LIDM%202026/WebCraft/src/views/Workspace.jsx)
Menambahkan tombol mengambang / aksi header `ti-award` (Rubrik CT) di Workspace yang membuka modal visual kriteria penilaian agar siswa tetap terarah.

### 4. Mesin Evaluasi AI

#### [MODIFY] [ai.ts](file:///d:/UNNES/Lomba/LIDM%202026/WebCraft/src/lib/ai.ts)
Menyesuaikan instruksi prompt Gemini di `suggestProjectScore` agar mengenali kriteria 4 pilar CT dan memetakan deskripsi penilaian dengan tepat.

---

## Verification Plan

### Automated Tests
- Menjalankan `npm run test` jika ada test suite yang aktif.

### Manual Verification
1. Login sebagai **Guru**, buka menu **Galeri Karya**, pilih tab **Perlu Dinilai**, klik **Beri Nilai**. Coba geser slider skor CT, periksa apakah teks deskripsi kriteria berubah real-time. Coba klik tombol shortcut (1-4) dan simpan nilai.
2. Login sebagai **Siswa**, buka detail tugas, pastikan pada langkah **Action** terdapat panel visual rubrik penilaian CT.
3. Masuk ke **Workspace**, klik tombol **Rubrik CT** di header/kontrol bar, pastikan modal berisi kriteria CT terbuka dengan visual rapi.
4. Periksa tab **Karya Saya** di akun siswa setelah dinilai, pastikan breakdown nilai per kriteria & deskripsi tingkat kualifikasi muncul.
