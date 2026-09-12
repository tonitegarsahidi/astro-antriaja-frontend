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
- **Fase 2: Mobile Web Pengunjung (`/ticket/[token]`):**
  - Implementasi `src/services/publicService.ts` untuk konsumsi data tiket publik via endpoint `GET /api/v1/public/tickets/:token`.
  - Pembuatan komponen UI: `TicketHeroStatus.astro`, `QueueProgress.astro`, `CounterInfoCard.astro`, dan `CallingAlert.astro`.
  - Pembuatan halaman mobile reaktif `src/pages/ticket/index.astro` dengan auto-detection token dari URL query/path, sinkronisasi realtime SSE multi-payload (`TICKET_CALLED`, `TICKET_SERVING`, `TICKET_HOLD`, `TICKET_COMPLETED`, `TICKET_TRANSFERRED`, `QUEUE_RESET`).
  - Fitur getaran haptic mobile (`navigator.vibrate`) dan nada dering sintesis Web Audio API saat nomor dipanggil.
  - Penambahan 15 unit & container tests baru (total 52 tests PASS 100%).
- **Fase 3: Portal Kiosk Mandiri Layar Sentuh (`/kiosk/[slug]`):**
  - Implementasi generator QR Code SVG mandiri `src/lib/qrCode.ts` (zero-dependency) untuk mencetak QR link tiket pengunjung.
  - Implementasi layer komunikasi `src/services/kioskService.ts` untuk mengambil layanan aktif (`GET /api/v1/kiosk/services`), mencetak tiket reguler & prioritas (`POST /api/v1/kiosk/tickets`), dan verifikasi PIN VIP (`POST /api/v1/kiosk/verify-pin`).
  - Pembuatan master layout `src/layouts/KioskLayout.astro` yang fullscreen, non-scrollable, anti-select, dilengkapi jam digital live dan status indikator konektivitas.
  - Pembuatan komponen UI kiosk:
    - `ServiceCard.astro`: Kartu tombol sentuh layanan dengan visual kuota/antrian aktif dan estimasi durasi.
    - `VIPModal.astro`: Modal keypad numerik sentuh layar (0-9, Backspace, Clear) dengan PIN masked dots untuk keamanan tanpa memunculkan keyboard OS Android/iPad.
    - `TicketModal.astro`: Popup konfirmasi struk tiket dengan nomor antrian besar, QR code interaktif, dan auto-close countdown 8 detik.
    - `ThermalReceipt.astro`: Format struk cetak thermal 58mm/80mm berbasis CSS `@media print` untuk mendukung silent printing pada kiosk printer hardware.
    - `KioskSetupModal.astro`: Form interaktif pairing Device Key dan URL API kiosk mandiri.
  - Pembuatan halaman interaktif `src/pages/kiosk/index.astro` dengan dynamic query & path routing, auto-refresh interval 30 detik, pencegahan double tap (anti race condition), dan audio feedback tombol sentuh.
  - Penambahan 15 unit & container tests baru (`qrCode.test.ts`, `kioskService.test.ts`, `kioskComponents.test.ts`, `kioskPage.test.ts`), seluruh 67 tests PASS 100% dan Astro static build sukses.

