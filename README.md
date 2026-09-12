# AntriAja (Frontend)

AntriAja adalah aplikasi web modern untuk sistem manajemen antrian yang dibangun menggunakan **AstroJS**, **TypeScript**, dukungan penuh **PWA (Progressive Web App)**, dan **Automated Unit Testing** dengan **Vitest**.

---

## 🌟 Fitur & Arsitektur Utama

- **AstroJS v7**: Framework berorientasi performa tinggi dengan arsitektur Island dan output statis/SSR optimal.
- **TypeScript Strict Mode**: Pengetikan ketat untuk menjaga keandalan kode dan pencegahan bug sedini mungkin.
- **Progressive Web App (PWA)**:
  - Terintegrasi menggunakan `@vite-pwa/astro` dan Workbox.
  - Manifest terkonfigurasi (`manifest.webmanifest`) dengan ikon standar (192x192, 512x512, apple-touch-icon).
  - Registrasi Service Worker otomatis (`autoUpdate`) untuk kapabilitas offline.
- **Integrasi Realtime Server-Sent Events (SSE)**:
  - Otomatis menghubungkan layar TV, Kiosk, HP Pengunjung, dan Konsol Staf ke event broker backend Go.
  - Dukungan multi-mode otentikasi query parameter (`device_key`, `ticket_token`, `token`, `tenant_slug`) dan reconnection backoff otomatis.
- **Web Audio & Speech Engine Pemanggil Antrian**:
  - Konversi angka ke kata bahasa Indonesia (1–999) terstandar (*nomor antrian A dua belas, menuju ke loket satu*).
  - Sintesis bel lonceng harmonis dua nada (C5 $\rightarrow$ E5) via Web Audio API tanpa dependensi berkas eksternal.
  - Antrian serial FIFO (*anti-collision*) untuk mencegah pemanggilan suara tumpang-tindih saat multi-loket memanggil serentak.
- **Automated Unit & Container Testing (Vitest)**:
  - 18 Test Suites, **98 Tests PASS (100%)** menguji komponen, routing, audio engine, HTTP/SSE client, dan storage.
- **AI Agent Guardrails & Guidelines**:
  - Terintegrasi dengan [`AGENTS.md`](./AGENTS.md), [`codingstyleguide.md`](./codingstyleguide.md), dan [`todolist.md`](./todolist.md).

---

## 📱 Katalog Rute Aplikasi

| Rute | Modul / Layanan | Deskripsi Fitur Utama |
| :--- | :--- | :--- |
| `/` | Portal Utama / Navigasi | Halaman beranda dan navigasi cepat menuju seluruh portal sistem antrian AntriAja. |
| `/ticket` | Mobile Web Pengunjung | Tampilan tiket tanpa kertas pengunjung HP: status tiket realtime (WAITING/CALLED/SERVING/dll), getaran haptic mobile, audio chime, dan offline snapshot. |
| `/kiosk` | Portal Kiosk Mandiri | Antarmuka layar sentuh pintu masuk: ambil tiket reguler, keypad sentuh PIN VIP 0-9 di layar (bebas popup OS keyboard), preview struk SVG QR Code, dan format cetak thermal printer 58mm/80mm. |
| `/display` | Layar Display TV Ruang Tunggu | Tampilan split-screen TV 16:9: nomor aktif raksasa dengan animasi pulsing glow, riwayat 3 tiket sebelumnya, media promosi (video loop / image banner), status seluruh loket, running text, dan suara pemanggil serial otomatis. |
| `/staff` *(Fase 5)* | Konsol Staf Loket | Antarmuka operasional staf loket untuk panggil, layani, tunda, dan transfer tiket. |
| `/admin` *(Fase 6)* | Panel Dashboard Admin | Manajemen master layanan, loket, display settings, dan laporan antrian. |

---

## 📁 Struktur Direktori Proyek

```text
src/
├── types/                # Kontrak TypeScript (cerminan DTO backend)
│   ├── api.types.ts      # Response envelope standard { success, data, error }
│   ├── auth.types.ts     # User, Tenant, JWT payload, Login DTO
│   ├── master.types.ts   # Service, Counter DTO
│   ├── queue.types.ts    # Ticket, TicketStatus, KioskServiceSummary DTO
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
│   ├── publicService.ts  # Cek status tiket mobile pengunjung
│   ├── kioskService.ts   # Layanan kiosk mandiri & tiket reguler/VIP
│   └── displayService.ts # Snapshot TV display & display settings
├── layouts/              # Master Layouts
│   ├── BaseLayout.astro    # Shell portal umum & PWA meta
│   ├── KioskLayout.astro   # Shell fullscreen touchscreen kiosk & digital clock
│   └── DisplayLayout.astro # Shell TV 16:9 high contrast & status SSE
├── components/           # Komponen UI Modular
│   ├── ticket/           # TicketHeroStatus, QueueProgress, CounterInfoCard, CallingAlert
│   ├── kiosk/            # ServiceCard, VIPModal, TicketModal, ThermalReceipt, KioskSetupModal
│   └── display/          # ActiveCallCard, RecentCallsList, MediaPromoSlim, CountersGrid, RunningText, AudioUnlockOverlay, DisplaySetupModal
└── pages/                # File-Based Routing Astro
    ├── index.astro       # Portal Navigasi AntriAja
    ├── ticket/index.astro# Mobile Web Tiket Pengunjung (?token=...)
    ├── kiosk/index.astro # Kiosk Mandiri (?slug=...&kiosk_key=...)
    └── display/index.astro# Layar Display TV (?slug=...&device_key=...)
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
- **Layar Display TV:**
  [http://localhost:4321/display?slug=demo-bank&device_key=display-demo-key-123](http://localhost:4321/display?slug=demo-bank&device_key=display-demo-key-123)
  *(Klik layar sekali pada splash overlay untuk meng-unlock Web Audio dan masuk fullscreen)*
- **Portal Kiosk Mandiri:**
  [http://localhost:4321/kiosk?slug=demo-bank&kiosk_key=kiosk-demo-key-123](http://localhost:4321/kiosk?slug=demo-bank&kiosk_key=kiosk-demo-key-123)
  *(Pilih layanan Teller / CS, atau gunakan PIN VIP `123456`)*
- **Mobile Web Pengunjung:**
  [http://localhost:4321/ticket?token=[token_tiket]](http://localhost:4321/ticket)

### 4. Menjalankan Pengujian Kualitas
```bash
# Menjalankan 18 automated test suites (98 unit & container tests)
npm test

# Memeriksa kepatuhan tipe TypeScript & diagnostik template
npm run check

# Membangun bundle produksi
npm run build
```

---

## 📜 Panduan Operasional & Koding

Setiap pengembang atau AI Agent yang bekerja pada repositori ini wajib mematuhi:
- **[`AGENTS.md`](./AGENTS.md)**: Alur kerja disiplin *Plan → Review → Test → Review → Build*.
- **[`codingstyleguide.md`](./codingstyleguide.md)**: Standar teknis penamaan, error handling, dan zero lint warnings.
- **[`todolist.md`](./todolist.md)**: Kompas pelacakan progres 7 fase pengerjaan proyek.
- **[`changelog.md`](./changelog.md)**: Catatan riwayat penambahan fitur dan perbaikan per fase.
