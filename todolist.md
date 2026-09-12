# PROJECT TODOLIST: CLOUD QUEUE MANAGEMENT SAAS (FRONTEND ASTRO)

Dokumen ini adalah kompas utama pelacakan progres implementasi frontend **AntriAja**.
Aturan: 
- Centang `[x]` jika sebuah item task telah selesai diimplementasikan dan diverifikasi (`npm run check` & `npm test`).
- Jangan menghapus riwayat task sebelumnya untuk menjaga transparansi riwayat pengerjaan.
- Seluruh pengerjaan wajib mematuhi alur **Plan → Review → Build** pada `AGENTS.md` dan standar kode `codingstyleguide.md`.

---

## 🏗️ Struktur Direktori Sasaran (Target Architecture)

```text
src/
├── types/                # Kontrak TypeScript (cerminan DTO backend)
│   ├── api.types.ts      # Response envelope standard { success, data, error }
│   ├── auth.types.ts     # User, Tenant, JWT payload, Login/Register DTO
│   ├── master.types.ts   # Service, Counter, CounterService DTO
│   ├── queue.types.ts    # Ticket, TicketStatus, QueueState, CallNext DTO
│   ├── display.types.ts  # DisplaySettings, ActiveCall, RecentCall DTO
│   └── sse.types.ts      # Event types & payload mappings
├── lib/                  # Utilities & Helpers
│   ├── httpClient.ts     # Wrapper Fetch API terstandar (auth headers, error handling)
│   ├── sseClient.ts      # EventSource wrapper (auto-reconnect, event dispatching)
│   ├── storage.ts        # Type-safe storage manager (tokens, device keys)
│   ├── formatters.ts     # Helper format nomor tiket, tanggal lokal, durasi mm:ss
│   └── audioPlayer.ts    # Web Audio Engine pemanggilan antrian TV
├── services/             # Layer Komunikasi API Backend
│   ├── authService.ts    # Login, register, me
│   ├── masterService.ts  # CRUD master layanan & loket
│   ├── kioskService.ts   # Layanan kiosk, ambil tiket reguler & VIP PIN
│   ├── queueService.ts   # Aksi panggil, serve, hold, transfer, complete
│   ├── displayService.ts # Snapshot TV & update pengaturan tampilan
│   └── publicService.ts  # Cek status tiket mobile pengunjung
├── layouts/              # Master Layouts
│   ├── BaseLayout.astro    # Master shell (PWA manifest, head, meta tags)
│   ├── KioskLayout.astro   # Shell kiosk layar sentuh fullscreen
│   ├── DisplayLayout.astro # Shell display TV 16:9 split-screen
│   ├── StaffLayout.astro   # Shell konsol staf loket
│   └── AdminLayout.astro   # Shell dashboard administrasi
├── components/           # Komponen UI Reusable
│   ├── ui/               # Button, Modal, Badge, Card, Spinner, Alert, Input
│   ├── kiosk/            # ServiceCard, VIPModal, TicketModal, ThermalReceipt
│   ├── display/          # ActiveCallCard, RecentCallsList, MediaPromoSlim, RunningText
│   ├── staff/            # CurrentServingCard, ActionButtonBar, WaitingList, HoldList
│   └── ticket/           # TicketHeroStatus, QueueProgress, NotificationBanner
└── pages/                # File-Based Routing Astro
    ├── index.astro                 # Portal navigasi / Landing page
    ├── kiosk/[slug].astro          # Antarmuka Kiosk Mandiri
    ├── display/[slug].astro        # Antarmuka Layar Display TV Ruang Tunggu
    ├── ticket/[token].astro        # Antarmuka Mobile Pengunjung (Paperless)
    ├── staff/
    │   ├── login.astro             # Login Staf Loket
    │   └── index.astro             # Konsol Operasional Loket
    └── admin/
        ├── login.astro             # Login Admin Cabang
        ├── index.astro             # Dashboard ringkasan antrian
        ├── services.astro          # Manajemen Layanan
        ├── counters.astro          # Manajemen Loket & Pemetaan M:N
        └── display.astro           # Pengaturan TV & Trigger Reset Harian
```

---

## 📋 DAFTAR FASE PENGERJAAN

### Fase 0: Inisialisasi & Setup Lingkungan Awal
- [x] Inisialisasi project AstroJS v7 dengan TypeScript Strict Mode
- [x] Konfigurasi PWA `@vite-pwa/astro` dengan Workbox auto-update dan icon set
- [x] Setup automated unit testing dengan Vitest dan `astro/container`
- [x] Penyusunan pedoman operasional agent (`AGENTS.md`)
- [x] Penyusunan panduan gaya teknis (`codingstyleguide.md`)
- [x] Verifikasi build awal (`npm run check` & `npm test` lulus tanpa error)

---

### Fase 1: Fondasi Arsitektur, Kontrak Tipe Data, & HTTP/SSE Client
- [x] Setup konfigurasi environment klien (`PUBLIC_API_BASE_URL` & `PUBLIC_SSE_BASE_URL`)
- [x] Definisi tipe TypeScript lengkap di `src/types/`:
  - [x] `api.types.ts` (Generic API response envelope, Error codes, Pagination DTO)
  - [x] `auth.types.ts` (User, Tenant, LoginRequest, MeResponse)
  - [x] `master.types.ts` (Service, Counter, CounterService M:N DTO)
  - [x] `queue.types.ts` (Ticket, TicketStatus, CallNext/Hold/Transfer DTO, CounterQueueState)
  - [x] `display.types.ts` (DisplaySnapshot, DisplaySettings, ActiveCall, RecentCall)
  - [x] `sse.types.ts` (EventType enum, AudioInstruction, TicketCalledPayload, SSEMessage)
- [x] Helper Utilities di `src/lib/`:
  - [x] `storage.ts` (Type-safe localStorage: JWT token, active counter, kiosk/display keys)
  - [x] `formatters.ts` (Format tiket A-001, durasi mm:ss, tanggal lokal ID)
  - [x] `httpClient.ts` (Fetch wrapper dengan otomatis auth bearer / device-key header dan error parsing)
  - [x] `sseClient.ts` (EventSource wrapper dengan auto-reconnect, handling heartbeat ping, dan typed listeners)
- [x] Master Base Layouts di `src/layouts/`:
  - [x] `BaseLayout.astro` (Head tag, PWA meta, global styles/design tokens)
- [x] Unit test untuk helper utilities (`httpClient.test.ts`, `storage.test.ts`, `formatters.test.ts`, `sseClient.test.ts`, `baseLayout.test.ts`)
- [x] Pembuatan `changelog.md` untuk mencatat riwayat perubahan berkala

---

### Fase 2: Mobile Web Pengunjung (`/ticket/[token]`)
- [x] Service layer: `src/services/publicService.ts` (`getPublicTicketByToken`)
- [x] Komponen UI Pengunjung di `src/components/ticket/`:
  - [x] `TicketHeroStatus.astro` (Nomor tiket besar, badge status WAITING/CALLED/SERVING/dll)
  - [x] `QueueProgress.astro` (Jumlah antrian di depan, estimasi waktu tunggu dalam menit)
  - [x] `CounterInfoCard.astro` (Nama dan nomor loket saat nomor dipanggil)
  - [x] `CallingAlert.astro` (Visual pulsing highlight & audio chimes saat status berubah jadi CALLED)
- [x] Halaman rute: `src/pages/ticket/index.astro`
  - [x] Ekstraksi token dari query URL `?token=...` atau path `/ticket/...`
  - [x] Client script: Langganan realtime SSE via `?ticket_token=[token]`
  - [x] Penanganan state dinamis (Waiting -> Called -> Serving -> Completed/Hold/Transferred)
  - [x] Penanganan tiket tidak ditemukan / tiket kadaluwarsa (Expired state)
  - [x] Offline caching via `sessionStorage` & auto-reconnect saat layar HP dibuka
- [x] Unit & Container test untuk halaman `/ticket` dan komponen pendukung (15 tests PASS)

---

### Fase 3: Portal Kiosk Mandiri Pintu Masuk (`/kiosk/[slug]`)
- [x] Service layer: `src/services/kioskService.ts` (`getKioskServices`, `issueKioskTicket`, `verifyVIPPIN`)
- [x] Layout khusus kiosk: `src/layouts/KioskLayout.astro` (Fullscreen, non-scroll, touch-friendly, jam digital & status koneksi)
- [x] Generator QR Code mandiri: `src/lib/qrCode.ts` (Zero-dependency SVG generator)
- [x] Komponen UI Kiosk di `src/components/kiosk/`:
  - [x] `ServiceCard.astro` (Kartu tombol layanan besar dengan indikator sisa antrian)
  - [x] `VIPModal.astro` (Modal keypad numerik sentuh layar 0-9 & visual dots untuk jalur prioritas)
  - [x] `TicketModal.astro` (Tampilan pop-up struk tiket dengan QR Code ke URL mobile dan hitung mundur 8 detik)
  - [x] `ThermalReceipt.astro` (Layout struk cetak thermal CSS `@media print` 58mm/80mm)
  - [x] `KioskSetupModal.astro` (Modal pairing Device Key dan URL API kiosk)
- [x] Halaman rute: `src/pages/kiosk/index.astro` (Mendukung query parameter `?slug=...` dan path fallback `/kiosk/[slug]`)
  - [x] Inisialisasi Device Key (`kiosk_key`) dari query atau localStorage
  - [x] Fetch daftar layanan aktif & realtime refresh
  - [x] Alur ambil tiket reguler
  - [x] Alur ambil tiket VIP via PIN modal keypad
  - [x] Auto-print & timer reset otomatis kembali ke layar awal (8 detik)
- [x] Unit & Container test untuk Kiosk (`qrCode.test.ts`, `kioskService.test.ts`, `kioskComponents.test.ts`, `kioskPage.test.ts` - 15 tests PASS)

---

### Fase 4: Layar Display TV Ruang Tunggu (`/display/[slug]`) & Audio Engine
- [x] Service layer: `src/services/displayService.ts` (`getDisplaySnapshot`)
- [x] Web Audio Engine: `src/lib/audioPlayer.ts`
  - [x] Inisialisasi AudioContext browser & unlock via gesture
  - [x] Mekanisme antrian pemutaran serial (Sequential FIFO Queue) anti tumpang-tindih suara
  - [x] Penyusunan ucapan bahasa Indonesia (*Bell -> Nomor Antrian -> Huruf -> Angka -> Menuju ke -> Loket -> Nomor Loket*)
  - [x] Sintesis bel lonceng Web Audio API (2-tone harmonic chime) & SpeechSynthesis bahasa Indonesia zero-dependency
- [x] Layout TV: `src/layouts/DisplayLayout.astro` (Rasio 16:9, typography high-contrast, jarak pandang 5-10m, jam digital live, indikator status SSE)
- [x] Komponen UI Display di `src/components/display/`:
  - [x] `AudioUnlockOverlay.astro` (Splash screen modal transparan *"Aktifkan Suara & Layar Penuh"*)
  - [x] `ActiveCallCard.astro` (Tampilan nomor aktif raksasa sisi kiri dengan animasi border pulse & fallback)
  - [x] `RecentCallsList.astro` (Riwayat 3-4 panggilan terakhir di sisi kiri bawah)
  - [x] `MediaPromoSlim.astro` (Pemutar video muted autoplay loop / banner gambar promosi sisi kanan)
  - [x] `CountersGrid.astro` (Grid informasi status seluruh loket operasional dan tiket yang dilayani)
  - [x] `RunningText.astro` (Running text marquee bergerak mulus di footer)
  - [x] `DisplaySetupModal.astro` (Modal pairing Device Key dan slug instansi)
- [x] Halaman rute: `src/pages/display/index.astro` (Mendukung dynamic query `?slug=...` dan path fallback `/display/[slug]`)
  - [x] Load snapshot inisialisasi TV dari endpoint backend
  - [x] Langganan realtime SSE (`TICKET_CALLED`, `TICKET_SERVING`, `TICKET_HOLD`, `TICKET_COMPLETED`, `TICKET_TRANSFERRED`, `COUNTER_STATUS_CHANGED`, `DISPLAY_SETTINGS_UPDATED`, `QUEUE_RESET`)
  - [x] Sinkronisasi state panggilan, transisi visual, dan pemutaran audio otomatis
- [x] Unit & Container test untuk Display TV & Audio Player (`audioPlayer.test.ts`, `displayService.test.ts`, `displayComponents.test.ts`, `displayPage.test.ts` - 31 tests PASS)

---

### Fase 5: Konsol Operasional Staf Loket (`/staff`)
- [x] Service layer: `src/services/authService.ts`, `src/services/counterService.ts`, `src/services/queueService.ts` (`callNext`, `recall`, `serve`, `hold`, `callHold`, `transfer`, `complete`, `getCounterQueueState`)
- [x] Layout Konsol Staf: `src/layouts/StaffLayout.astro` (Header status, jam digital, indikator SSE, lepas loket & logout)
- [x] Komponen UI Staf di `src/components/staff/`:
  - [x] `CounterSelectorModal.astro` (Pilih & Occupy loket saat mulai shift)
  - [x] `CurrentServingCard.astro` (Info tiket aktif + stopwatch timer durasi pelayanan)
  - [x] `ActionButtonBar.astro` (Panggil Berikutnya, Panggil Ulang, Mulai Layani, Tunda, Selesai, Oper)
  - [x] `WaitingListTab.astro` (Daftar antrian menunggu dengan penanda VIP di baris teratas)
  - [x] `HoldListTab.astro` (Daftar tiket tunda dengan tombol Panggil Kembali)
  - [x] `TransferModal.astro` (Modal pilih layanan tujuan transfer)
  - [x] `StaffReleaseModal.astro` (Modal konfirmasi pelepasan loket dengan proteksi tiket sibuk)
- [x] Halaman rute:
  - [x] `src/pages/staff/login.astro` (Form login staf, simpan JWT token & tenant slug)
  - [x] `src/pages/staff/index.astro` (Dashboard utama konsol operasional dengan sinkronisasi realtime SSE multi-event)
- [x] Penanganan proteksi operasional:
  - [x] Penanganan error `409 Conflict` (`COUNTER_STILL_BUSY`, `STAFF_HAS_ACTIVE_TICKET`, `COUNTER_ALREADY_OCCUPIED`)
  - [x] Konfirmasi sebelum Release loket
- [x] Unit & Container test untuk Konsol Staf (5 test suites, 32 tests PASS 100%)

---

### Fase 6: Panel Administrasi Cabang (`/admin`)
- [x] Layout Admin: `src/layouts/AdminLayout.astro` (Sidebar navigasi & header profil)
- [x] Halaman rute:
  - [x] `src/pages/admin/login.astro` (Login Admin dengan validasi role)
  - [x] `src/pages/admin/index.astro` (Dashboard statistik ringkas)
  - [x] `src/pages/admin/services.astro` (CRUD Master Layanan: prefix, durasi, toggle status)
  - [x] `src/pages/admin/counters.astro` (CRUD Master Loket & penugasan layanan M:N)
  - [x] `src/pages/admin/display.astro` (Pengaturan teks berjalan TV & media promo)
- [x] Fitur Darurat Reset Harian:
  - [x] Modal konfirmasi ganda reset antrian (`POST /api/v1/admin/queues/reset`)
- [x] Unit & Container test untuk Panel Admin (6 test suites, 24 tests PASS 100%)

---

### Fase 7: PWA Hardening, Offline Resilience, & Final Audit
- [x] Sinkronisasi manifest PWA dan icon set (192x192, 512x512 maskable, apple-touch-icon)
- [x] Pengaturan Workbox runtime caching untuk file audio dan layout statis
- [x] Offline fallback view (ketika koneksi internet terputus total)
- [x] Audit menyeluruh: `npm run check`, `npm test`, dan `npm run build`
- [x] Dokumentasi penggunaan frontend lengkap pada `README.md`

