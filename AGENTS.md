# AGENTS.md - Core Operational Rules & Guidelines

File ini adalah komando operasional utama (single source of truth) untuk AI Coding Agent. Wajib dibaca dan dipatuhi sebelum menganalisis, merencanakan, atau memodifikasi kode apa pun di repositori ini.

---

## 1. Filosofi & Perilaku Utama (Core Principles)
- **Anti "Prompt Sapu Jagat":** Jangan pernah mencoba membangun seluruh aplikasi atau multi-fitur sekaligus dalam satu respon. Kerjakan sistem secara modular dan bertahap.
- **Plan → Review → Test → Review → Build:** Jangan langsung menulis kode implementasi fitur. Setiap modul wajib melalui perancangan, review rencana, penyusunan test plan & unit test, review test, baru eksekusi implementasi (Test-Driven Mindset).
- **Klarifikasi Sebelum Asumsi:** Jika instruksi pengguna memiliki ambiguitas logika, arsitektur, atau dependensi bisnis, ajukan pertanyaan klarifikasi terlebih dahulu sebelum membuat rencana atau menulis kode.
- **Production-Grade Mindset:** Tolak mentalitas "yang penting jalan". Setiap kode harus mempertimbangkan penanganan error, transaksi database (DB transaction), pencegahan race condition, dan logging terstruktur.

---

## 2. Protokol Alur Kerja: Plan → Review → Test → Review → Build

Setiap kali menerima tugas fitur, modul, atau refactoring baru, Agent wajib mengikuti 5 tahapan berurutan berikut:

### Tahap 1: Analisis & Klarifikasi
1. Pelajari file arsitektur dan dokumentasi terkait di folder `/docs` serta panduan gaya di `codingstyleguide.md`.
2. Jika ada informasi kebutuhan bisnis yang kurang, buat daftar pertanyaan spesifik untuk user.

### Tahap 2: Implementation Plan (Rencana Implementasi)
Sajikan draf rencana implementasi tertulis kepada user dengan format:
- **Daftar File:** File yang akan dibuat baru (`NEW`), diubah (`MODIFIED`), atau dihapus (`DELETED`).
- **Skema / Migrasi / Konfigurasi:** Detail perubahan tabel/kolom/env (jika ada).
- **Fungsi & Method:** Rincian fungsi/endpoint/interface yang akan ditambahkan.
- **Alur Logika & Validasi:** Ringkasan alur data dari input sampai output.
- **Risiko / Edge Cases:** Potensi kegagalan data atau race condition.
> **PENTING:** Berhenti di sini. Tunggu persetujuan (*review/approval*) dari user sebelum membuat test plan atau menulis test!

### Tahap 3: Test Plan & Pembuatan Unit Test (Test-First)
1. Susun Test Plan (skenario pengujian positif, negatif, edge cases, input-output).
2. Tulis file automated unit test (`*.test.ts`) sesuai skenario yang direncanakan.
3. Sajikan Test Plan dan file test kepada user untuk direview.
> **PENTING:** Berhenti di sini. Tunggu persetujuan (*review/approval*) dari user atas Test Plan & Unit Test sebelum mengeksekusi kode implementasi fitur!

### Tahap 4: Eksekusi Kode Implementasi (Build & Green Test)
1. Eksekusi kode implementasi hanya untuk modul atau sub-langkah yang telah disetujui.
2. Pastikan seluruh unit test yang dibuat pada Tahap 3 lulus (`npm test` berstatus PASS).
3. Pastikan tidak ada type/lint error (`npm run check` 0 errors).
4. Jangan menyentuh file di luar cakupan rencana yang telah disepakati.

### Tahap 5: Verifikasi & Pencatatan Progres
1. Jalankan `npm run check`, `npm test`, dan `npm run build`.
2. Update checklist progres pada `todolist.md` dan catat perubahan pada `changelog.md`.

---

## 3. Ekosistem Dokumen Pendukung (Guardrails)
Agent wajib menghormati pemisahan tanggung jawab file berikut:
- **`AGENTS.md` (File ini):** Aturan perilaku, guardrails operasional, dan alur kerja Agent.
- **`codingstyleguide.md`:** Standar penulisan teknis (konvensi penamaan tabel snake_case, format class PascalCase, pola error handling, struktur folder). Kode wajib patuh 100% pada file ini.
- **`/docs/*`:** Cetak biru spesifikasi fitur, diagram relasi, dan aturan domain bisnis.
- **`todolist.md`:** Kompas progres task. Centang item yang selesai, jangan hapus riwayat task sebelumnya.
- **`changelog.md`:** Catatan ringkas perubahan file dan fitur per sesi kerja.

---

## 4. Batasan & Larangan Keras (Strict Constraints)
- **Dilarang Install Library Tanpa Izin:** Jangan menjalankan perintah `npm install`, `go get`, `composer require`, atau package manager lain sebelum menjelaskan urgensi dependensi tersebut dan mendapat konfirmasi user.
- **Dilarang Mengubah File Sensitif:** Jangan modifikasi konfigurasi database utama, credential/secret, atau environment variables (`.env`, config deploy) kecuali tugasnya secara spesifik meminta hal tersebut.
- **Atomic Modification:** Edit bagian kode yang relevan saja. Dilarang merombak ulang atau menghapus fungsi lain yang sedang berjalan stabil di dalam file yang sama.
- **Jangan Mengotori Repositori:** Jangan membuat file dummy, file backup manual (seperti `file_backup.go`, `temp.js`), atau file uji coba sembarangan di luar direktori test yang ditentukan.

---

## 5. Protokol Anti "Looping Sesat" & Error Recovery
Jika Agent mengalami error berulang saat eksekusi atau running test/terminal:
1. **Deteksi Mandiri:** Jika perbaikan yang sama gagal lebih dari 2 kali, **STOP**. Jangan terus mencoba solusi acak yang merusak file lain.
2. **Laporkan Kegagalan:** Beritahu user secara transparan:
   - Apa yang dicoba.
   - Mengapa error tetap muncul.
   - Hipotesis penyebab akar masalah (*root cause*).
3. **Minta Reset / Pecah Langkah:** Sarankan user untuk memeriksa Git Diff (`git restore .`) jika kode mulai tidak stabil, dan tawarkan penguraian masalah menjadi langkah analisis yang lebih atomik.

---

## 6. Standar Kualitas Produksi (Production-Grade Checklist)
Sebelum menyatakan sebuah task selesai, Agent harus memverifikasi:
- [ ] Apakah operasi database multi-tabel dibungkus dalam Database Transaction?
- [ ] Apakah ada potensi race condition jika diakses multi-user secara bersamaan?
- [ ] Apakah error ditangani secara eksplisit (bukan sekadar silent fail atau print log kosong)?
- [ ] Apakah kode mematuhi konvensi penamaan yang tertulis di `codingstyleguide.md`?