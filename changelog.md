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
  - Penambahan 15 unit & container tests baru (`qrCode.test.ts`, `kioskService.test.ts`, `kioskComponents.test.ts`, `kioskPage.test.ts`), seluruh 67 tests PASS 100% dan Astro static build sukses.
- **Fase 4: Layar Display TV Ruang Tunggu (`/display/[slug]`) & Audio Engine:**
  - Implementasi mesin audio pemanggil nomor antrian `src/lib/audioPlayer.ts` dengan konversi angka ke kata bahasa Indonesia (1–999), sintesis nada lonceng 2-nada (Web Audio API C5 $\rightarrow$ E5 chime), Web Speech API bahasa Indonesia zero-dependency, dan antrian serial FIFO anti-collision.
  - Implementasi service layer `src/services/displayService.ts` untuk mengambil status snapshot TV display dari backend (`GET /api/v1/display/:tenant_slug`).
  - Pembuatan master layout `src/layouts/DisplayLayout.astro` rasio 16:9 fullscreen, kontras tinggi, jam digital real-time, dan status indikator SSE.
  - Pembuatan komponen UI display TV di `src/components/display/`:
    - `ActiveCallCard.astro`: Tampilan nomor aktif raksasa dengan animasi glowing/pulsing saat dipanggil, nama loket tujuan, dan layanan.
    - `RecentCallsList.astro`: Riwayat 3–4 panggilan tiket terakhir di kiri bawah.
    - `MediaPromoSlim.astro`: Pemutar video muted autoplay loop, banner gambar, atau fallback tenant card.
    - `CountersGrid.astro`: Grid status seluruh loket operasional (SERVING, IDLE, BREAK) dan tiket yang sedang dilayani.
    - `RunningText.astro`: Marquee teks pengumuman berjalan horizontal mulus di footer.
    - `AudioUnlockOverlay.astro`: Splash modal interaksi klik awal untuk membuka blokir autoplay audio browser dan mode fullscreen.
    - `DisplaySetupModal.astro`: Form interaktif konfigurasi device key display TV dan slug instansi.
  - Pembuatan halaman interaktif `src/pages/display/index.astro` dengan split-screen 65%:35%, integrasi SSE realtime multi-event (`TICKET_CALLED`, `TICKET_SERVING`, `TICKET_HOLD`, `TICKET_COMPLETED`, `TICKET_TRANSFERRED`, `COUNTER_STATUS_CHANGED`, `DISPLAY_SETTINGS_UPDATED`, `QUEUE_RESET`), pemutaran suara berseri otomatis, dan shortcut keyboard `Ctrl + Shift + S`.
  - Penambahan 4 test suite baru (total 98 tests PASS 100% di 18 test files) dan Astro build static sukses.
  - Penambahan parameter `deviceKey` pada `getDisplaySnapshot` (`displayService.ts`) dan integrasi injection header `X-Device-Key` untuk otorisasi snapshot TV Display pada backend.


