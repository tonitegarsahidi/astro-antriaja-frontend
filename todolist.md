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
  - [x] Refaktor 1-Klik Occupy Modal Loket: eksekusi langsung, visual spinner loading kartu, auto-dismiss modal, dan tombol batal ganti loket
  - [x] Redesain & Polishing Halaman Login Staf & Admin (Sub-Langkah 2): layout split-hero desktop, tab alih peran Staf/Admin, helper 1-klik autofill demo, dan toggle intip password
  - [x] Polishing Layout & Estetika Konsol Staf & Admin (Sub-Langkah 3): banner pemandu loket belum dipilih, tombol aksi loket ergonomis, kartu tiket modern, drawer menu mobile responsif Admin, dan kartu metrik dashboard
- [x] Unit & Container test untuk Konsol Staf & Admin (159 tests PASS 100%)

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
- [x] Integrasi styling Tailwind CSS v4 dan generator QR Code standar offline
- [x] Eliminasi unlayered universal reset pada BaseLayout yang menimpa CSS Cascade Layers Tailwind v4 (pemulihan padding, margin, border, dan modern clean styling pada /staff, /admin, dan login)
- [x] Dokumentasi penggunaan frontend lengkap pada `README.md`

---

### Fase 8: Landing Page & Portal Navigasi Utama (`/`)
- [x] Redesain rute `/` ([`src/pages/index.astro`](src/pages/index.astro)) menjadi Landing Page komprehensif, modern, dan informatif.
- [x] Top navigation bar sticky dengan brand identity, badge SaaS, dan tombol pintas login Staf & Admin.
- [x] Hero section dengan headline value proposition, ringkasan BYOD tanpa hardware lock-in, dan tombol CTA utama ke Kiosk & Display.
- [x] Katalog 5 modul fungsionalitas sistem lengkap dengan deskripsi mendalam, target perangkat, tag fitur kunci, dan tautan langsung (`/kiosk`, `/display`, `/ticket`, `/staff`, `/admin`).
- [x] Section alur operasional 4-langkah (Ambil Tiket $\rightarrow$ Pantau $\rightarrow$ Panggilan Loket $\rightarrow$ Selesai).
- [x] Footer metadata arsitektur sistem (Astro v7, Tailwind CSS v4, PWA, Golang Fiber, PostgreSQL).
- [x] Unit & container testing komprehensif pada [`tests/index.test.ts`](tests/index.test.ts) (5 tests PASS 100%, total 163 tests PASS).

---

### Fase 9: Pengetatan Setup Device, Device Key Admin, & Menu Pengaturan Kiosk/Display
- [x] Eliminasi fallback hardcoded demo pada Kiosk (`/kiosk`) dan penegakan alur input `slug` & `kiosk_key` via `KioskSetupModal`.
- [x] Pengetatan `device_key` wajib pada Layar Display TV (`/display`) dan `DisplaySetupModal` (`required` & label `WAJIB`).
- [x] Implementasi card manajemen Display Device Key pada Panel Admin (`/admin/display`) dengan input, copy to clipboard, simpan ke browser, dan parameter URL otomatis.
- [x] Implementasi komponen `DeviceSettingsMenu.astro` (icon button gear di sudut kiri bawah sebelah teks Pengumuman).
- [x] Fitur Logout / Reset Device Configuration (pembersihan storage & buka kembali modal pairing).
- [x] Fitur Toggle Fullscreen (masuk/keluar layar penuh via Fullscreen API).
- [x] Fitur Toggle Dark/Light Mode dengan persistensi tema di `localStorage` dan styling adaptif.
- [x] Automated testing: 31 test suites / 167 tests PASS 100% dan verifikasi `npm run check` 0 errors.

---

### Fase 10: Pengaturan Tenant & Manajemen Staf Petugas (Modul A3)
- [x] Kontrak Tipe Data TypeScript di `src/types/`:
  - [x] `tenant.types.ts` (`TenantProfileResponse`, `UpdateTenantProfileRequest`, `RotateDeviceKeyRequest`, `RotateDeviceKeyResponse`)
  - [x] `user.types.ts` (`StaffResponse`, `CreateStaffRequest`, `UpdateStaffRequest`, `StaffListResponse`)
- [x] Service layer di `src/services/`:
  - [x] `tenantService.ts` (`getTenantProfile`, `updateTenantProfile`, `rotateDeviceKey`)
  - [x] `userService.ts` (`listStaff`, `getStaff`, `createStaff`, `updateStaff`, `deactivateStaff`)
- [x] Komponen UI & Modal di `src/components/admin/`:
  - [x] `StaffFormModal.astro` (Modal form tambah/edit staf dengan role badge dan validasi kredensial)
- [x] Halaman Administrasi Baru di `src/pages/admin/`:
  - [x] `users.astro` (Manajemen staf petugas: filter role/status, statistik staf, aksi tambah/edit/nonaktifkan)
  - [x] `settings.astro` (Pengaturan profil instansi, aturan antrian harian & PIN VIP, serta rotasi cryptographic device keys kiosk & display TV)
- [x] Integrasi Navigasi Sidebar di `src/layouts/AdminLayout.astro`:
  - [x] Penambahan menu "Petugas Staf" (`/admin/users`) dan "Pengaturan" (`/admin/settings`)
  - [x] Automated testing: 32 test suites / 171 automated tests PASS 100% dan verifikasi `npm run check` 0 errors, `npm run build` sukses.

---

### Fase 11: Registrasi Mandiri Tenant & Onboarding Setup Wizard (Modul B2)
- [x] Kontrak Tipe Data TypeScript di `src/types/auth.types.ts`:
  - [x] Penambahan atribut SaaS profil instansi (`status`, `phone`, `address`, `timezone`, `logo_url`) pada `TenantResponse`
  - [x] Penambahan `is_active` dan `last_login_at` pada `UserResponse`
  - [x] Penambahan `phone`, `address`, `timezone` pada `RegisterTenantRequest`
- [x] Service layer di `src/services/authService.ts`:
  - [x] Implementasi fungsi `registerTenant(data: RegisterTenantRequest): Promise<ApiResponse<RegisterTenantResponse>>`
- [x] Ekspor Utilitas Storage di `src/lib/storage.ts`:
  - [x] Ekspor objek modular `storage` untuk kemudahan akses method storage
- [x] Halaman Registrasi Baru di `src/pages/register.astro`:
  - [x] Form pendaftaran mandiri interaktif dengan 2 seksi (Profil Instansi & Kredensial Administrator)
  - [x] Real-time slug auto-formatter dari nama instansi beserta live preview URL Kiosk
  - [x] Penanganan konflik slug duplikat (`SLUG_ALREADY_EXISTS`) dan email duplikat ramah pengguna
  - [x] Penyimpanan token dan navigasi otomatis ke wizard onboarding
- [x] Halaman Onboarding Setup Wizard di `src/pages/onboarding.astro`:
  - [x] Panduan 3 langkah setup instansi baru pasca-registrasi
  - [x] Kartu kredensial Kiosk Mandiri dan Layar Display TV dengan tombol Salin URL instan
  - [x] Tombol uji buka Kiosk Mandiri dan Display TV di browser baru
  - [x] Tombol navigasi langsung ke Dashboard Admin
- [x] Integrasi CTA Landing Page di `src/pages/index.astro`:
  - [x] Tombol CTA "Daftar Gratis" di navbar atas dan "🚀 Daftar Gratis Sekarang" di hero section
- [x] Automated testing: 33 test suites / 177 automated tests PASS 100% dan verifikasi `npm run check` 0 errors, `npm run build` sukses (16 static routes).

---

### Fase 12: Platform Super-Admin CMS Dashboard (Modul C3)
- [x] Kontrak Tipe Data TypeScript di `src/types/platform.types.ts`:
  - [x] `PlatformAdmin`, `PlatformLoginRequest`, `PlatformLoginResponse`
  - [x] `PlatformMetricsResponse` (total_tenants, active_tenants, suspended_tenants, trial_tenants, total_tickets_today)
  - [x] `PlatformTenantListItem`, `PlatformTenantListResponse`, `PlatformTenantDetailResponse`
  - [x] `CreatePlatformTenantRequest`, `UpdatePlatformTenantStatusRequest`, `RotatePlatformDeviceKeyRequest`, `RotatePlatformDeviceKeyResponse`
- [x] Isolasi Storage Token Platform di `src/lib/storage.ts`:
  - [x] `getPlatformToken()`, `setPlatformToken()`, `removePlatformToken()` terisolasi dalam key `antriaja_platform_token` tanpa tabrakan sesi dengan admin tenant (`antriaja_token`).
- [x] Service layer di `src/services/platformService.ts`:
  - [x] `platformLogin(req)`
  - [x] `getPlatformMe()`
  - [x] `getPlatformMetrics()`
  - [x] `listPlatformTenants(params)`
  - [x] `getPlatformTenant(id)`
  - [x] `createPlatformTenant(req)`
  - [x] `updatePlatformTenantStatus(id, status, reason)`
  - [x] `rotatePlatformDeviceKey(id, type)`
  - [x] `deletePlatformTenant(id)`
- [x] Layout Super-Admin di `src/layouts/PlatformLayout.astro`:
  - [x] Sidebar navigasi mandiri, badge super-admin ungu, proteksi sesi client-side, dan tombol logout.
- [x] Halaman Super-Admin Baru di `src/pages/platform/`:
  - [x] `login.astro`: Form login super-admin dengan penanganan error dan redirect otomatis.
  - [x] `index.astro`: Dashboard metrik global real-time (Total Tenant, Aktif, Suspended, Tiket Hari Ini) serta panduan dan aksi cepat.
  - [x] `tenants.astro`: Konsol supervisi tenant lengkap dengan live search, filter status, tabel instansi, paginasi, modal tambah tenant, modal penangguhan/aktivasi, dan modal rotasi kunci perangkat darurat (Kiosk/Display).
- [x] Automated testing: 34 test suites / 192 automated tests PASS 100% dan verifikasi `npm run check` 0 errors, `npm run build` sukses (19 static routes).

---

### Fase 13: Dashboard Analitik & Pelaporan Cabang (Modul D2)
- [x] Kontrak Tipe Data TypeScript di `src/types/analytics.types.ts`:
  - [x] `DailyTrendItem`, `AnalyticsSummaryResponse`, `PeakHourItem`, `ServiceAnalyticsItem`, `StaffAnalyticsItem`.
- [x] Service Layer di `src/services/analyticsService.ts`:
  - [x] `getAnalyticsSummary(startDate, endDate)`: Mengambil ringkasan metrik antrian dan tren harian.
  - [x] `getPeakHours(date)`: Mengambil distribusi jam sibuk 24-jam.
  - [x] `getServiceMetrics(startDate, endDate)`: Mengambil performa per kategori layanan.
  - [x] `getStaffPerformance(startDate, endDate)`: Mengambil produktivitas staf petugas.
  - [x] `exportAnalyticsCSV(startDate, endDate)`: Mengunduh berkas CSV laporan operasional.
- [x] Integrasi Navigasi Sidebar di `src/layouts/AdminLayout.astro`:
  - [x] Penambahan tipe `activePage` 'analytics'.
  - [x] Penambahan menu "Analitik & Laporan" (`/admin/analytics`) dengan ikon grafik bar.
- [x] Halaman Dashboard Analitik di `src/pages/admin/analytics.astro`:
  - [x] Filter rentang tanggal dengan preset cepat (Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir) dan pemilih tanggal manual.
  - [x] 6 Kartu Metrik Utama: Total Tiket, Tiket Selesai, Kadaluwarsa, Rata-rata Waktu Tunggu, Rata-rata Waktu Layan, Tingkat Penyelesaian (%).
  - [x] Grafik Batang Distribusi Jam Sibuk 24 Jam (Zero-dependency SVG/CSS dengan tooltip).
  - [x] Tabel Performa Kategori Layanan (Total, Selesai, Waktu Tunggu, Waktu Layan, Tingkat Sukses).
  - [x] Tabel Produktivitas & Kecepatan Kerja Staf Petugas.
  - [x] Tombol 1-klik unduh berkas CSV laporan operasional.
- [x] Automated testing: 35 test suites / 199 automated tests PASS 100% dan verifikasi `npm run check` 0 errors, `npm run build` sukses (20 static routes).

---

### Fase 14: Billing & Subscription UI (Modul E2)
- [x] Kontrak Tipe Data TypeScript di `src/types/subscription.types.ts`:
  - [x] `PlanResponse` (id, code, name, description, price_monthly, max_counters, max_services, max_staff, max_daily_tickets, features)
  - [x] `UsageStats` (counters_count, max_counters, services_count, max_services, staff_count, max_staff, today_tickets, max_daily_tickets)
  - [x] `SubscriptionDetailResponse` (id, tenant_id, status, current_period_start, current_period_end, plan, usage)
  - [x] `UpgradePlanRequest` (plan_code)
  - [x] `InvoiceResponse` (id, tenant_id, invoice_number, amount, status, paid_at, due_date, created_at)
- [x] Service Layer di `src/services/subscriptionService.ts`:
  - [x] `getPlans()`: Mengambil katalog seluruh paket langganan (`GET /plans`).
  - [x] `getCurrentSubscription()`: Mengambil detail paket aktif dan ringkasan kuota terpakai (`GET /subscriptions/current`).
  - [x] `upgradePlan(req)`: Mengajukan pergantian/upgrade paket (`POST /subscriptions/upgrade`).
  - [x] `getInvoices()`: Mengambil riwayat invoice langganan (`GET /subscriptions/invoices`).
- [x] Integrasi Navigasi Sidebar di `src/layouts/AdminLayout.astro`:
  - [x] Penambahan tipe `activePage` 'billing'.
  - [x] Penambahan menu "Paket & Langganan" (`/admin/billing`) dengan ikon kartu kredit/pembayaran.
- [x] Halaman Dashboard Paket & Langganan di `src/pages/admin/billing.astro`:
  - [x] Banner status paket aktif (Free / Starter / Pro / Enterprise), status langganan, dan periode aktif.
  - [x] 4 Meteran Progres Kuota Operasional (Meja Loket, Kategori Layanan, Petugas Staf, Tiket Hari Ini) dengan penanganan unlimited & indikator warna dinamis.
  - [x] Kartu Komparasi Paket (Pricing Cards 4-kolom) dengan label kuota, list fitur, badge terpopuler, dan tombol pilih/upgrade.
  - [x] Modal Konfirmasi Upgrade Paket dengan rincian biaya, penyesuaian kuota langsung, dan validasi loading.
  - [x] Tabel Riwayat Invoice & Tagihan dengan format mata uang IDR dan status pembayaran badge (Lunas, Menunggu, Dibatalkan).
- [x] Automated testing: 36 test suites / 205 automated tests PASS 100% dan verifikasi `npm run check` 0 errors, `npm run build` sukses (21 static routes).

---

### Fase 15: Sinkronisasi Dokumentasi & Integrasi Ekosistem SaaS
- [x] Sinkronisasi katalog kontrak DTO dan integrasi REST endpoint backend (14 modul lengkap).
- [x] Sinkronisasi dokumentasi antarmuka dan rute PWA (21 static routes) dengan spesifikasi backend.
- [x] Verifikasi regresi kualitas frontend: `npm run check` (0 error, 0 warning) dan `npm test` (36 test suites / 205 automated tests PASS 100%).
- [x] Sinkronisasi riwayat `todolist.md` dan `changelog.md` lintas repositori.

---

### Fase 16: Redesain Navigasi Admin Sidebar, Reorganisasi Display Key, & Advanced Audio/TTS Engine
- [x] Redesain Navigasi Admin Sidebar (`AdminLayout.astro`):
  - [x] Pengelompokan menu bernavigasi hierarkis: "Navigasi Utama", "Operasional Antrian", dan "Pengaturan & Sistem".
  - [x] Drawer mobile slide-over dengan backdrop overlay gelap (`#admin-sidebar-backdrop`).
  - [x] Kartu profil user administrator terpadu dan tombol logout eksplisit yang menonjol (`#btn-admin-logout`).
- [x] Reorganisasi Pengaturan Display (`src/pages/admin/display.astro`):
  - [x] Integrasi Display Device Key ke dalam formulir pengaturan utama tepat di bawah seksi panggilan suara/TTS.
  - [x] Mempertahankan kompatibilitas ID elemen (`#input-display-device-key`, `#btn-copy-device-key`, `#btn-save-device-key`).
  - [x] Pembersihan kolom samping kanan menjadi informasi operasional TV yang lebih rapi.
- [x] Advanced Audio & TTS Engine (Langkah 2):
  - [x] Sintesis bel lonceng Web Audio API multi-pilihan (6 variasi nada bel: `ding_dong`, `tri_tone`, `airport`, `single_ting`, `soft_pulse`, `marimba` + 1 hening: `none`).
  - [x] Opsi konfigurasi bahasa ucapan (`id-ID`, `en-US`), preferensi karakter suara (`female`, `male`), kontrol pitch dinamis (0.5 - 1.5), dan tempo slider (0.7 - 1.3).
  - [x] Tombol pratinjau audio interaktif "Uji Suara Panggilan" dengan visual loading dan unlock AudioContext.
  - [x] Solusi Karakter Suara Pria (Baritone Pitch Modulation & Native Detection):
    - [x] Deteksi otomatis native male voice per bahasa (kata kunci nama suara pria: `ardi`, `david`, `guy`, `mark`, `george`, `wira`, `anto`, `budi`, dll).
    - [x] Fallback modulasi pitch baritone ($0.75\times$ pitch, $0.95\times$ rate) saat browser hanya memiliki suara wanita (misal Google Bahasa Indonesia di Chrome/Linux) sehingga suara terdengar maskulin/baritone secara natural tanpa dependensi eksternal.
    - [x] Live hint indikator deteksi suara pada form admin (`#hint-voice-gender` di `/admin/display`) yang mendeteksi suara native vs modulasi baritone aktif secara realtime.
  - [x] Sinkronisasi realtime ke TV Display (`/display`) via SSE event `DISPLAY_SETTINGS_UPDATED`.
  - [x] Automated testing: 36 test suites / 212 tests PASS 100%, `npm run check` 0 errors, `npm run build` sukses (21 static routes).
