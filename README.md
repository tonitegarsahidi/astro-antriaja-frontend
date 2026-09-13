# AntriAja (Frontend)

AntriAja adalah sistem manajemen antrian cloud modern berbasis web yang dibangun menggunakan **AstroJS v7**, **TypeScript**, dukungan penuh **PWA (Progressive Web App)**, **Offline Resilience**, dan **Automated Unit & Container Testing** dengan **Vitest**.

---

## 🌟 Fitur & Arsitektur Utama

- **AstroJS v7 (Island Architecture)**: Framework berorientasi performa tinggi dengan output statis optimal dan partial hydration.
- **TypeScript Strict Mode**: Pengetikan ketat untuk menjaga keandalan kode, zero any type leakage, dan pencegahan bug sedini mungkin.
- **Progressive Web App (PWA) & Offline Resilience**:
  - Terintegrasi menggunakan `@vite-pwa/astro` dan Workbox runtime caching.
  - Web Manifest lengkap dengan tema `#2563eb`, background `#f8fafc`, ikon standar (192x192, 512x512 maskable, apple-touch-icon), dan 4 Application Shortcuts (Kiosk, Display TV, Staf, Admin).
  - Strategi caching cerdas: `CacheFirst` untuk aset gambar/ikon, `StaleWhileRevalidate` untuk berkas statis CSS/JS, dan `navigateFallback: '/offline'` dengan API denylist `[/^\/api/]`.
  - Floating connection banner reaktif ([`OfflineBanner.astro`](./src/components/ui/OfflineBanner.astro)) dan halaman fallback mandiri ([`/offline`](./src/pages/offline.astro)).
- **Integrasi Realtime Server-Sent Events (SSE)**:
  - Otomatis menghubungkan seluruh antarmuka (Display TV, Kiosk, HP Pengunjung, Konsol Staf, dan Admin) ke broker backend Go Fiber.
  - Multi-mode query authentication (`device_key`, `ticket_token`, `token`, `tenant_slug`) dengan auto-reconnect backoff.
- **Web Audio & Speech Engine Pemanggil Antrian**:
  - Konversi angka ke kata bahasa Indonesia (1–999) terstandar (*"Nomor antrian A dua belas, menuju ke loket satu"*).
  - Sintesis nada bel dua nada harmonik (C5 $\rightarrow$ E5) via Web Audio API tanpa dependensi berkas suara eksternal.
  - Antrian serial FIFO (*anti-collision*) untuk mencegah tabrakan audio saat multi-loket memanggil serentak.
- **Automated Unit & Container Testing (Vitest)**:
  - **35 Test Suites**, **199 Automated Tests PASS (100%)** menguji komponen, routing, audio engine, HTTP/SSE client, storage, RBAC platform, CMS supervisi, analitik, dan proteksi operasional.
- **AI Agent Guardrails & Guidelines**:
  - Terintegrasi dengan [`AGENTS.md`](./AGENTS.md), [`codingstyleguide.md`](./codingstyleguide.md), dan [`todolist.md`](./todolist.md).

---

## 📱 Katalog Rute Aplikasi (20 Halaman Statis)

| Rute | Modul / Antarmuka | Deskripsi Fitur Utama |
| :--- | :--- | :--- |
| `/` | Portal Utama & Landing Page | Landing page publik AntriAja, tombol pendaftaran instansi baru ("Daftar Gratis"), dan navigasi portal. |
| `/register` | Registrasi Mandiri Tenant | Form pendaftaran mandiri instansi baru (profil instansi, slug auto-format real-time, kredensial admin). |
| `/onboarding` | Wizard Setup Onboarding | Panduan 3 langkah instansi baru (penyiapan Kiosk, Display TV, tombol salin URL, dan navigasi admin). |
| `/ticket` | Mobile Web Pengunjung | Tiket paperless HP: status realtime (WAITING/CALLED/SERVING), getaran haptic mobile, audio chime, dan offline snapshot. |
| `/kiosk` | Portal Kiosk Mandiri | Layar sentuh pintu masuk: ambil tiket reguler, keypad PIN VIP 0-9 di layar, preview struk QR Code, dan format print thermal 58mm/80mm. |
| `/display` | Display TV Ruang Tunggu | Split-screen TV 16:9: nomor aktif raksasa dengan animasi pulsing glow, riwayat tiket, video promo/banner loop, status loket, running text, dan audio announcer bahasa Indonesia. |
| `/staff/login` | Login Staf Loket | Form login akun staf loket berbasis JWT token dan slug instansi. |
| `/staff` | Konsol Staf Loket | Konsol operasional loket: panggil berikutnya, panggil ulang, mulai layani, tunda (*hold*), oper (*transfer*), selesai, stopwatch durasi pelayanan, dan daftar tunggu antrian. |
| `/admin/login` | Login Administrator Cabang | Form login khusus administrator cabang dengan proteksi RBAC role `admin` dan rate limiting. |
| `/admin` | Dashboard Admin Cabang | Ringkasan statistik operasional cabang (layanan, loket, staf on duty, tiket menunggu) dan navigasi cepat. |
| `/admin/analytics` | Dashboard Analitik & Laporan | Visualisasi metrik volume, jam sibuk 24 jam (SVG/CSS chart), breakdown performa layanan, throughput staf, filter tanggal, dan 1-klik unduh CSV. |
| `/admin/services` | Master Kategori Layanan | Manajemen tabel layanan (tambah, edit, nonaktifkan), prefix kode tiket (A-Z), dan estimasi waktu pelayanan. |
| `/admin/counters` | Master Meja Loket | Manajemen kartu loket fisik dan pemetaan relasi multi-layanan (M:N) yang ditangani tiap loket. |
| `/admin/users` | Manajemen Staf Petugas | Manajemen akun staf loket cabang (tambah, edit nama/password, filter role/status, soft deactivation). |
| `/admin/settings` | Pengaturan Profil & Kunci | Pengaturan identitas cabang, aturan antrian, PIN VIP, daily reset time, dan rotasi mandiri kunci Kiosk/Display. |
| `/admin/display` | Pengaturan Display TV | Form konfigurasi teks berjalan (running text), media promo gambar/video, toggle TTS suara panggilan, dan Live Preview monitor TV. |
| `/platform/login` | Login Platform Super-Admin | Form login autentikasi terisolasi untuk staf internal tim platform AntriAja. |
| `/platform` | Dashboard Platform CMS | Dashboard metrik global SaaS (Total Tenant, Aktif, Suspended, Trial, Tiket Hari Ini) dan panduan operasional. |
| `/platform/tenants` | Supervisi Tenant Platform | Konsol pengawasan instansi lengkap: live search, filter status, pendaftaran tenant via CMS, penangguhan/aktivasi, dan rotasi paksa kunci perangkat darurat. |
| `/offline` | Fallback Mode Offline | Tampilan mandiri saat koneksi internet klien terputus total dengan tombol muat ulang koneksi. |

---

## 📁 Struktur Direktori Proyek

```text
src/
├── types/                # Kontrak TypeScript (cerminan DTO backend)
│   ├── analytics.types.ts# DTO Analitik (Summary, PeakHour, Services, Staff)
│   ├── api.types.ts      # Response envelope standard { success, data, error }
│   ├── auth.types.ts     # User, Tenant, JWT payload, Login DTO
│   ├── display.types.ts  # DisplaySettings, ActiveCall, RecentCall DTO
│   ├── master.types.ts   # Service, Counter, CounterService M:N DTO
│   ├── platform.types.ts # PlatformUser, PlatformMetrics, PlatformTenant DTO
│   ├── queue.types.ts    # Ticket, TicketStatus, QueueState, ResetQueueResponse DTO
│   ├── sse.types.ts      # Event types, AudioInstruction & SSE payloads
│   └── user.types.ts     # CreateUser, UpdateUser, UserList DTO
├── lib/                  # Utilities & Helpers
│   ├── audioPlayer.ts    # Web Audio Engine & serial queue pemanggil suara Indonesia
│   ├── formatters.ts     # Helper format nomor tiket, tanggal lokal, durasi mm:ss
│   ├── httpClient.ts     # Wrapper Fetch API dengan header injection & error envelope
│   ├── qrCode.ts         # Generator QR Code SVG mandiri (zero-dependency)
│   ├── sseClient.ts      # EventSource wrapper (auto-reconnect, typed listeners)
│   └── storage.ts        # Type-safe SSR-safe localStorage manager (tenant & platform tokens)
├── services/             # Layer Komunikasi REST API Backend
│   ├── adminService.ts   # Eksekusi reset darurat antrian harian
│   ├── analyticsService.ts# API Analitik & Pelaporan operasional antrian + CSV
│   ├── authService.ts    # Login kredensial, verifikasi sesi & registrasi tenant mandiri
│   ├── counterService.ts # Manajemen loket fisik & penugasan layanan M:N
│   ├── displayService.ts # Snapshot TV display & display settings
│   ├── kioskService.ts   # Layanan kiosk mandiri & tiket reguler/VIP
│   ├── platformService.ts# API Platform Super-Admin CMS & supervisi tenant
│   ├── publicService.ts  # Cek status tiket mobile pengunjung
│   ├── queueService.ts   # Orkestrasi operasional staf loket (panggil, layani, tunda, oper)
│   ├── serviceService.ts # CRUD master kategori layanan antrian
│   ├── tenantService.ts  # Pengaturan profil instansi & rotasi kunci perangkat
│   └── userService.ts    # CRUD manajemen staf petugas loket
├── layouts/              # Master Layouts
│   ├── AdminLayout.astro    # Shell panel administrasi cabang, sidebar navigasi & reset
│   ├── BaseLayout.astro     # Shell portal umum, PWA manifest, dan OfflineBanner global
│   ├── DisplayLayout.astro  # Shell TV 16:9 high contrast & status SSE
│   ├── KioskLayout.astro    # Shell fullscreen touchscreen kiosk & digital clock
│   ├── PlatformLayout.astro # Shell konsol Super-Admin platform CMS
│   └── StaffLayout.astro    # Shell konsol operasional staf loket & live counter badge
├── components/           # Komponen UI Modular
│   ├── admin/            # ResetConfirmModal, ServiceFormModal, CounterFormModal
│   ├── display/          # ActiveCallCard, RecentCallsList, MediaPromoSlim, CountersGrid, RunningText, AudioUnlockOverlay, DisplaySetupModal
│   ├── kiosk/            # ServiceCard, VIPModal, TicketModal, ThermalReceipt, KioskSetupModal
│   ├── staff/            # CurrentServingCard, ActionButtonBar, WaitingListTab, HoldListTab, TransferModal, CounterSelectorModal, StaffReleaseModal
│   ├── ticket/           # TicketHeroStatus, QueueProgress, CounterInfoCard, CallingAlert
│   └── ui/               # OfflineBanner
└── pages/                # File-Based Routing Astro (20 Halaman Statis)
    ├── index.astro                 # Portal Navigasi & Landing Page Publik
    ├── register.astro              # Form Pendaftaran Mandiri Instansi Baru
    ├── onboarding.astro            # Wizard Setup 3 Langkah Instansi Baru
    ├── ticket/index.astro          # Mobile Web Tiket Pengunjung (?token=...)
    ├── kiosk/index.astro           # Kiosk Mandiri (?slug=...&kiosk_key=...)
    ├── display/index.astro         # Layar Display TV (?slug=...&device_key=...)
    ├── offline.astro               # Fallback Navigasi Offline
    ├── staff/
    │   ├── login.astro             # Login Petugas Loket
    │   └── index.astro             # Konsol Operasional Staf Loket
    ├── platform/
    │   ├── login.astro             # Login Staf Platform Super-Admin
    │   ├── index.astro             # Dashboard Platform Super-Admin CMS
    │   └── tenants.astro           # Konsol Supervisi Tenant Platform
    └── admin/
        ├── login.astro             # Login Administrator Cabang
        ├── index.astro             # Dashboard Ringkasan Cabang
        ├── analytics.astro         # Dashboard Analitik & Laporan Operasional
        ├── services.astro          # Manajemen Master Layanan
        ├── counters.astro          # Manajemen Meja Loket (M:N)
        ├── users.astro             # Manajemen Staf Petugas Loket
        ├── settings.astro          # Pengaturan Profil Cabang & Kunci
        └── display.astro           # Konfigurasi Display TV & Live Preview
```

---

## 🚀 Panduan Menjalankan & Mencoba Aplikasi

### 1. Prasyarat Lingkungan
- **Node.js**: v18+ atau v20+
- **Backend AntriAja**: Server Go Fiber berjalan di `http://localhost:8080`
- **Database PostgreSQL**: Berjalan di `localhost:5432`

### 2. Menjalankan Frontend
```bash
# Menjalankan development server
npm run dev
# Server aktif di: http://localhost:4321
```

### 3. URL Akses Demo (Tenant: `demo-bank`)
- **Portal Navigasi Utama:**
  [http://localhost:4321/](http://localhost:4321/)
- **Layar Display TV:**
  [http://localhost:4321/display?slug=demo-bank&device_key=display-demo-key-123](http://localhost:4321/display?slug=demo-bank&device_key=display-demo-key-123)
  *(Klik layar sekali pada splash overlay untuk meng-unlock Web Audio dan masuk fullscreen)*
- **Portal Kiosk Mandiri:**
  [http://localhost:4321/kiosk?slug=demo-bank&kiosk_key=kiosk-demo-key-123](http://localhost:4321/kiosk?slug=demo-bank&kiosk_key=kiosk-demo-key-123)
  *(Pilih layanan Teller / CS, atau gunakan PIN VIP `123456`)*
- **Mobile Web Pengunjung:**
  [http://localhost:4321/ticket?token=[token_tiket]](http://localhost:4321/ticket)
- **Konsol Staf Loket:**
  [http://localhost:4321/staff/login](http://localhost:4321/staff/login)
- **Panel Administrasi Cabang:**
  [http://localhost:4321/admin/login](http://localhost:4321/admin/login)

### 4. Menjalankan Pengujian Kualitas
```bash
# Menjalankan 30 automated test suites (159 unit & container tests)
npm test

# Memeriksa kepatuhan tipe TypeScript & diagnostik template (0 errors)
npm run check

# Membangun bundle produksi statis (12 halaman + PWA manifest & Service Worker)
npm run build
```

---

## 📜 Panduan Operasional & Koding

Setiap pengembang atau AI Agent yang bekerja pada repositori ini wajib mematuhi:
- **[`AGENTS.md`](./AGENTS.md)**: Alur kerja disiplin *Plan → Review → Test → Review → Build*.
- **[`codingstyleguide.md`](./codingstyleguide.md)**: Standar teknis penamaan, error handling, dan zero lint warnings.
- **[`todolist.md`](./todolist.md)**: Kompas pelacakan progres 7 fase pengerjaan proyek.
- **[`changelog.md`](./changelog.md)**: Catatan riwayat penambahan fitur dan perbaikan per fase.
