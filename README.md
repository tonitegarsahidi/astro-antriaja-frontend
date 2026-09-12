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
  - **30 Test Suites**, **159 Automated Tests PASS (100%)** menguji komponen, routing, audio engine, HTTP/SSE client, storage, dan proteksi operasional.
- **AI Agent Guardrails & Guidelines**:
  - Terintegrasi dengan [`AGENTS.md`](./AGENTS.md), [`codingstyleguide.md`](./codingstyleguide.md), dan [`todolist.md`](./todolist.md).

---

## 📱 Katalog Rute Aplikasi

| Rute | Modul / Antarmuka | Deskripsi Fitur Utama |
| :--- | :--- | :--- |
| `/` | Portal Utama | Landing page dan navigasi cepat menuju seluruh portal sistem antrian AntriAja. |
| `/ticket` | Mobile Web Pengunjung | Tiket paperless HP: status realtime (WAITING/CALLED/SERVING), getaran haptic mobile, audio chime, dan offline snapshot. |
| `/kiosk` | Portal Kiosk Mandiri | Layar sentuh pintu masuk: ambil tiket reguler, keypad PIN VIP 0-9 di layar, preview struk QR Code, dan format print thermal 58mm/80mm. |
| `/display` | Display TV Ruang Tunggu | Split-screen TV 16:9: nomor aktif raksasa dengan animasi pulsing glow, riwayat tiket, video promo/banner loop, status loket, running text, dan audio announcer bahasa Indonesia. |
| `/staff/login` | Login Staf Loket | Form login akun staf loket berbasis JWT token dan slug instansi. |
| `/staff` | Konsol Staf Loket | Konsol operasional loket: panggil berikutnya, panggil ulang, mulai layani, tunda (*hold*), oper (*transfer*), selesai, stopwatch durasi pelayanan, dan daftar tunggu antrian. |
| `/admin/login` | Login Administrator | Form login khusus administrator cabang dengan proteksi RBAC role `admin` dan rate limiting. |
| `/admin` | Dashboard Admin | Ringkasan statistik operasional cabang (layanan, loket, staf on duty, tiket menunggu) dan navigasi cepat. |
| `/admin/services` | Master Kategori Layanan | Manajemen tabel layanan (tambah, edit, nonaktifkan), prefix kode tiket (A-Z), dan estimasi waktu pelayanan. |
| `/admin/counters` | Master Meja Loket | Manajemen kartu loket fisik dan pemetaan relasi multi-layanan (M:N) yang ditangani tiap loket. |
| `/admin/display` | Pengaturan Display TV | Form konfigurasi teks berjalan (running text), media promo gambar/video, toggle TTS suara panggilan, dan Live Preview monitor TV. |
| `/offline` | Fallback Mode Offline | Tampilan mandiri saat koneksi internet klien terputus total dengan tombol muat ulang koneksi. |

---

## 📁 Struktur Direktori Proyek

```text
src/
├── types/                # Kontrak TypeScript (cerminan DTO backend)
│   ├── api.types.ts      # Response envelope standard { success, data, error }
│   ├── auth.types.ts     # User, Tenant, JWT payload, Login DTO
│   ├── master.types.ts   # Service, Counter, CounterService M:N DTO
│   ├── queue.types.ts    # Ticket, TicketStatus, QueueState, ResetQueueResponse DTO
│   ├── display.types.ts  # DisplaySettings, ActiveCall, RecentCall DTO
│   └── sse.types.ts      # Event types, AudioInstruction & SSE payloads
├── lib/                  # Utilities & Helpers
│   ├── httpClient.ts     # Wrapper Fetch API dengan header injection & error envelope
│   ├── sseClient.ts      # EventSource wrapper (auto-reconnect, typed listeners)
│   ├── storage.ts        # Type-safe SSR-safe localStorage manager
│   ├── formatters.ts     # Helper format nomor tiket, tanggal lokal, durasi mm:ss
│   ├── qrCode.ts         # Generator QR Code SVG mandiri (zero-dependency)
│   └── audioPlayer.ts    # Web Audio Engine & serial queue pemanggil suara Indonesia
├── services/             # Layer Komunikasi REST API Backend
│   ├── authService.ts    # Login kredensial & verifikasi sesi
│   ├── serviceService.ts # CRUD master kategori layanan antrian
│   ├── counterService.ts # Manajemen loket fisik & penugasan layanan M:N
│   ├── queueService.ts   # Orkestrasi operasional staf loket (panggil, layani, tunda, oper)
│   ├── displayService.ts # Snapshot TV display & display settings
│   ├── adminService.ts   # Eksekusi reset darurat antrian harian
│   ├── kioskService.ts   # Layanan kiosk mandiri & tiket reguler/VIP
│   └── publicService.ts  # Cek status tiket mobile pengunjung
├── layouts/              # Master Layouts
│   ├── BaseLayout.astro    # Shell portal umum, PWA manifest, dan OfflineBanner global
│   ├── KioskLayout.astro   # Shell fullscreen touchscreen kiosk & digital clock
│   ├── DisplayLayout.astro # Shell TV 16:9 high contrast & status SSE
│   ├── StaffLayout.astro   # Shell konsol operasional staf loket & live counter badge
│   └── AdminLayout.astro   # Shell panel administrasi, sidebar 4 menu & trigger reset
├── components/           # Komponen UI Modular
│   ├── ui/               # OfflineBanner
│   ├── ticket/           # TicketHeroStatus, QueueProgress, CounterInfoCard, CallingAlert
│   ├── kiosk/            # ServiceCard, VIPModal, TicketModal, ThermalReceipt, KioskSetupModal
│   ├── display/          # ActiveCallCard, RecentCallsList, MediaPromoSlim, CountersGrid, RunningText, AudioUnlockOverlay, DisplaySetupModal
│   ├── staff/            # CurrentServingCard, ActionButtonBar, WaitingListTab, HoldListTab, TransferModal, CounterSelectorModal, StaffReleaseModal
│   └── admin/            # ResetConfirmModal, ServiceFormModal, CounterFormModal
└── pages/                # File-Based Routing Astro (12 Halaman Statis)
    ├── index.astro                 # Portal Navigasi AntriAja
    ├── ticket/index.astro          # Mobile Web Tiket Pengunjung (?token=...)
    ├── kiosk/index.astro           # Kiosk Mandiri (?slug=...&kiosk_key=...)
    ├── display/index.astro         # Layar Display TV (?slug=...&device_key=...)
    ├── offline.astro               # Fallback Navigasi Offline
    ├── staff/
    │   ├── login.astro             # Login Petugas Loket
    │   └── index.astro             # Konsol Operasional Staf Loket
    └── admin/
        ├── login.astro             # Login Administrator Cabang
        ├── index.astro             # Dashboard Ringkasan Cabang
        ├── services.astro          # Manajemen Master Layanan
        ├── counters.astro          # Manajemen Meja Loket (M:N)
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
