# CHANGELOG: FRONTEND ANTRIAJA

Seluruh perubahan penting, penambahan fitur, dan perbaikan pada repositori frontend dicatat di sini.
Format mengacu pada prinsip Keep a Changelog dan konvensi semantik.

---

## [Unreleased] - 2026-09-12

### Ditambahkan
- Inisialisasi kompas pelacakan proyek [todolist.md](file:///home/ruangrimbun/MOREDATA/KERJA3/ANTRIAJA/astro-antriaja-frontend/todolist.md) yang mencakup 7 fase pengerjaan terukur (Fondasi Arsitektur, Mobile Web Pengunjung, Kiosk Mandiri, Display TV, Konsol Staf, Panel Admin, PWA Hardening).
- Penyusunan master arsitektur direktori frontend modular (`types/`, `lib/`, `services/`, `layouts/`, `components/`, `pages/`).
- **Fase 1: Fondasi Arsitektur, Kontrak Tipe Data, & HTTP/SSE Client:**
  - Pembuatan kontrak tipe data TypeScript lengkap di `src/types/` (`api`, `auth`, `master`, `queue`, `display`, `sse`) yang selaras 100% dengan backend.
  - Implementasi utilitas `storage.ts` untuk type-safe browser storage dengan proteksi SSR dan recovery error.
  - Implementasi utilitas `formatters.ts` untuk format tiket, stopwatch mm:ss, dan tanggal Indonesia.
  - Implementasi wrapper `httpClient.ts` dengan otomatisasi injection JWT Bearer / Device-Key, dan standard backend error envelope parsing.
  - Implementasi `sseClient.ts` berbasis query parameter authentication (`token`, `device_key`, `ticket_token`), auto-reconnect backoff, dan typed event dispatcher.
  - Pembuatan layout induk `BaseLayout.astro` dengan CSS Design Tokens terpadu, meta viewport, PWA manifest, dan theme-color `#2563eb`.
  - Penambahan automated test suite komprehensif (37 tests PASS) mencakup unit test formatters, storage, httpClient, sseClient, dan container BaseLayout.
