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
- [ ] Service layer: `src/services/displayService.ts` (`getDisplaySnapshot`)
- [ ] Web Audio Engine: `src/lib/audioPlayer.ts`
  - [ ] Inisialisasi AudioContext browser
  - [ ] Mekanisme antrian pemutaran serial (Sequential Playlist) anti tumpang-tindih suara
  - [ ] Penyusunan klip audio bahasa Indonesia (*Bell -> Nomor Antrian -> Huruf -> Angka -> Menuju ke -> Loket -> Nomor Loket*)
- [ ] Penyediaan/pengorganisasian berkas audio suara (.mp3) di `public/audio/`
- [ ] Layout TV: `src/layouts/DisplayLayout.astro` (Rasio 16:9, typography high-contrast, jarak pandang 5-10m)
- [ ] Komponen UI Display di `src/components/display/`:
  - [ ] `AutoplayOverlay.astro` (Splash screen modal *"Klik Layar untuk Mengaktifkan Suara"*)
  - [ ] `ActiveCallCard.astro` (Tampilan nomor aktif besar sisi kiri dengan animasi border pulse)
  - [ ] `RecentCallsList.astro` (Riwayat 3 panggilan terakhir di sisi kiri bawah)
  - [ ] `MediaPromoSlim.astro` (Pemutar video/gambar promosi sisi kanan tanpa suara)
  - [ ] `RunningText.astro` (Running text marquee di footer)
  - [ ] `DigitalClock.astro` (Jam digital real-time & tanggal)
- [ ] Halaman rute: `src/pages/display/[slug].astro`
  - [ ] Load snapshot inisialisasi TV
  - [ ] Langganan realtime SSE (`TICKET_CALLED`, `COUNTER_STATUS_CHANGED`, `DISPLAY_SETTINGS_UPDATED`, `QUEUE_RESET`)
  - [ ] Sinkronisasi state panggilan dan pemutaran audio otomatis
- [ ] Unit & Container test untuk Display TV & Audio Player

---

### Fase 5: Konsol Operasional Staf Loket (`/staff`)
- [ ] Service layer: `src/services/queueService.ts` (`callNext`, `recall`, `serve`, `hold`, `callHold`, `transfer`, `complete`, `getCounterQueueState`)
- [ ] Layout Konsol Staf: `src/layouts/StaffLayout.astro`
- [ ] Komponen UI Staf di `src/components/staff/`:
  - [ ] `CounterSelectorModal.astro` (Pilih & Occupy loket saat mulai shift)
  - [ ] `CurrentServingCard.astro` (Info tiket aktif + stopwatch timer durasi pelayanan)
  - [ ] `ActionButtonBar.astro` (Panggil Berikutnya, Panggil Ulang, Mulai Layani, Tunda, Selesai, Oper)
  - [ ] `WaitingListTab.astro` (Daftar antrian menunggu dengan penanda VIP di baris teratas)
  - [ ] `HoldListTab.astro` (Daftar tiket tunda dengan tombol Panggil Kembali)
  - [ ] `TransferModal.astro` (Modal pilih layanan tujuan transfer)
- [ ] Halaman rute:
  - [ ] `src/pages/staff/login.astro` (Form login staf, simpan JWT token & tenant slug)
  - [ ] `src/pages/staff/index.astro` (Dashboard utama konsol operasional)
- [ ] Penanganan proteksi operasional:
  - [ ] Penanganan error `409 Conflict` (`COUNTER_STILL_BUSY`, `STAFF_HAS_ACTIVE_TICKET`)
  - [ ] Konfirmasi sebelum Release loket
- [ ] Unit & Container test untuk Konsol Staf

---

### Fase 6: Panel Administrasi Cabang (`/admin`)
- [ ] Layout Admin: `src/layouts/AdminLayout.astro` (Sidebar navigasi & header profil)
- [ ] Halaman rute:
  - [ ] `src/pages/admin/login.astro` (Login Admin dengan validasi role)
  - [ ] `src/pages/admin/index.astro` (Dashboard statistik ringkas)
  - [ ] `src/pages/admin/services.astro` (CRUD Master Layanan: prefix, durasi, toggle status)
  - [ ] `src/pages/admin/counters.astro` (CRUD Master Loket & penugasan layanan M:N)
  - [ ] `src/pages/admin/display.astro` (Pengaturan teks berjalan TV & media promo)
- [ ] Fitur Darurat Reset Harian:
  - [ ] Modal konfirmasi ganda reset antrian (`POST /api/v1/admin/queues/reset`)
- [ ] Unit & Container test untuk Panel Admin

---

### Fase 7: PWA Hardening, Offline Resilience, & Final Audit
- [ ] Sinkronisasi manifest PWA dan icon set (192x192, 512x512 maskable, apple-touch-icon)
- [ ] Pengaturan Workbox runtime caching untuk file audio dan layout statis
- [ ] Offline fallback view (ketika koneksi internet terputus total)
- [ ] Audit menyeluruh: `npm run check`, `npm test`, dan `npm run build`
- [ ] Dokumentasi penggunaan frontend lengkap pada `README.md`
