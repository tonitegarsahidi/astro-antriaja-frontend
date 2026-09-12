# AntriAja (Frontend)

AntriAja adalah aplikasi web modern untuk sistem manajemen antrian yang dibangun menggunakan **AstroJS**, **TypeScript**, dukungan penuh **PWA (Progressive Web App)**, dan **Automated Unit Testing** dengan **Vitest**.

---

## 🌟 Fitur & Arsitektur Utama

- **AstroJS**: Framework berorientasi performa tinggi dengan arsitektur Island dan output statis/SSR optimal.
- **TypeScript Strict Mode**: Pengetikan ketat untuk menjaga keandalan kode dan pencegahan bug sedini mungkin.
- **Progressive Web App (PWA)**:
  - Terintegrasi menggunakan `@vite-pwa/astro` dan Workbox.
  - Manifest terkonfigurasi (`manifest.webmanifest`) dengan ikon standar (192x192, 512x512, apple-touch-icon).
  - Registrasi Service Worker otomatis (`autoUpdate`) untuk kapabilitas offline.
- **Automated Unit Testing**:
  - Menggunakan Vitest dan Astro Container API (`astro/container`).
  - Pengujian terisolasi untuk rendering komponen/halaman dan validasi konfigurasi PWA.
- **AI Agent Guardrails & Guidelines**:
  - Terintegrasi dengan [`AGENTS.md`](./AGENTS.md) dan [`codingstyleguide.md`](./codingstyleguide.md) sebagai panduan operasional dan gaya penulisan kode.

---

## 📁 Struktur Direktori

```text
/
├── public/                 # Aset statis (ikon PWA, favicon)
├── src/
│   ├── pages/              # Halaman web (file-based routing Astro)
│   │   └── index.astro     # Halaman utama AntriAja
│   ├── env.d.ts            # Deklarasi tipe global Astro & Vite PWA
│   └── pwa.ts              # Inisialisasi & registrasi Service Worker
├── tests/                  # Automated unit test suite
│   ├── index.test.ts       # Test render halaman utama
│   └── pwa.test.ts         # Test konfigurasi PWA
├── astro.config.mjs        # Konfigurasi Astro & integrasi PWA
├── codingstyleguide.md     # Standar penulisan kode & best practices AI
├── AGENTS.md               # Aturan operasional utama AI Coding Agent
├── tsconfig.json           # Konfigurasi TypeScript
├── vitest.config.ts        # Konfigurasi Vitest
└── package.json            # Dependensi dan skrip proyek
```

---

## 🚀 Perintah Pengembangan (Commands)

### Instalasi Dependensi
```bash
npm install
```

### Server Development
```bash
# Menjalankan dev server biasa
npm run dev

# Menjalankan dev server di background (sesuai rekomendasi AGENTS.md)
npx astro dev --background

# Mengecek status dev server background
npx astro dev status

# Menghentikan dev server background
npx astro dev stop
```

### Pengujian & Pengecekan Tipe
```bash
# Menjalankan seluruh automated unit test
npm test

# Menjalankan test dalam mode watch interaktif
npm run test:watch

# Memeriksa kepatuhan tipe TypeScript (Astro check)
npm run check
```

### Build & Deploy
```bash
# Build produksi ke direktori dist/
npm run build

# Menjalankan preview lokal dari hasil build
npm run preview
```

---

## 📜 Panduan Kontribusi & Koding

Setiap pengembang atau AI Agent yang bekerja pada repositori ini wajib membaca dan mematuhi:
- **[`AGENTS.md`](./AGENTS.md)**: Alur kerja Plan → Review → Build dan batas operasional agent.
- **[`codingstyleguide.md`](./codingstyleguide.md)**: Konvensi penamaan, struktur kode, dan checklist kualitas sebelum commit.
