# AntriAja - Coding Style Guide & AI Agent Best Practices

Panduan standar penulisan kode teknis (Technical Coding Standards) untuk repositori frontend **AntriAja**. Seluruh AI Coding Agent dan pengembang wajib mematuhi aturan ini secara konsisten.

---

## 1. Prinsip Utama (Core Principles)

1. **Strict TypeScript:** Wajib menggunakan tipe data eksplisit. Dilarang keras menggunakan `any` tanpa alasan yang sangat mendesak (jika terpaksa, sertakan komentar penjelas).
2. **KISS & Modular:** Tulis kode yang sederhana, mudah dipahami, dan terisolasi dalam modul-modul kecil dengan tanggung jawab tunggal (Single Responsibility Principle).
3. **PWA & Offline-First Awareness:** Setiap penambahan aset, rute, atau interaktivitas klien harus mempertimbangkan strategi caching Service Worker dan performa offline.
4. **Resilience & Explicit Error Handling:** Tangani error secara eksplisit (try/catch, validasi respon HTTP, feedback UI). Jangan biarkan exception tidak tertangani (*silent failure*).
5. **Zero Lint & Type Warning:** Kode baru tidak boleh menambah error atau peringatan pada `astro check` dan unit test.

---

## 2. Struktur Direktori Proyek (Project Structure)

```text
/
├── public/              # Aset statis publik (ikon PWA, favicon, manifest)
├── src/
│   ├── components/      # Komponen UI modular (.astro atau framework island)
│   ├── layouts/         # Template layout induk (.astro)
│   ├── lib/             # Utilities, helper functions, formatters (.ts)
│   ├── services/        # Komunikasi API, storage, dan integrasi backend (.ts)
│   ├── types/           # Definisi interface dan type TypeScript (.ts)
│   ├── pages/           # File routing berbasis rute Astro (.astro)
│   ├── env.d.ts         # Deklarasi tipe global TypeScript dan Vite plugins
│   └── pwa.ts           # Skrip registrasi Service Worker PWA
├── tests/               # Automated unit & integration tests (*.test.ts)
├── astro.config.mjs     # Konfigurasi utama Astro dan integrasi (PWA, dll)
├── vitest.config.ts     # Konfigurasi pengujian unit (Vitest)
└── tsconfig.json        # Konfigurasi TypeScript
```

---

## 3. Konvensi Penamaan (Naming Conventions)

### 3.1. Berkas & Folder
| Target | Konvensi | Contoh |
| :--- | :--- | :--- |
| Komponen Astro | `PascalCase.astro` | `QueueCard.astro`, `Navbar.astro` |
| Layout Astro | `PascalCase.astro` | `BaseLayout.astro`, `AppLayout.astro` |
| Halaman Rute | `kebab-case.astro` / `[param].astro` | `index.astro`, `ambil-antrian.astro`, `[id].astro` |
| Utilities & Helpers | `camelCase.ts` | `formatDate.ts`, `calculateWaitTime.ts` |
| Services & Client API | `camelCase.ts` | `queueApi.ts`, `notificationService.ts` |
| Types & Interfaces | `PascalCase.ts` / `*.types.ts` | `queue.types.ts`, `User.ts` |
| File Testing | `*.test.ts` atau `*.spec.ts` | `index.test.ts`, `queueApi.test.ts` |

### 3.2. Kode (TypeScript & Astro)
| Target | Konvensi | Contoh |
| :--- | :--- | :--- |
| Interface & Type Alias | `PascalCase` (tanpa prefix `I`) | `QueueTicket`, `CounterStatus` |
| Class & Enum | `PascalCase` | `QueueManager`, `TicketStatus` |
| Fungsi & Method | `camelCase` (diawali kata kerja) | `getTicket()`, `renderQueueNumber()` |
| Variabel & Properti | `camelCase` | `currentNumber`, `waitingList` |
| Konstanta Global | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_LOCALE` |
| Props Komponen Astro | `interface Props { ... }` | Ditentukan di frontmatter komponen |
| Database / API Payload | `snake_case` saat payload API, konversi ke `camelCase` di data layer | `queue_number` → `queueNumber` |

---

## 4. Standar Penulisan Komponen Astro

### 4.1. Struktur Frontmatter & Template
Gunakan pemisahan yang bersih antara bagian Server Script (frontmatter `---`) dan Template HTML:

```astro
---
// 1. External imports
import { pwaInfo } from 'virtual:pwa-info';

// 2. Internal components / layouts
import BaseLayout from '../layouts/BaseLayout.astro';

// 3. Types
interface Props {
  title: string;
  subtitle?: string;
}

// 4. Props destructuring & logic
const { title, subtitle = 'Default Subtitle' } = Astro.props;
---

<BaseLayout title={title}>
  <header>
    <h1>{title}</h1>
    {subtitle && <p class="subtitle">{subtitle}</p>}
  </header>
</BaseLayout>

<style>
  /* Scoped styling */
  .subtitle {
    color: #64748b;
    font-size: 0.875rem;
  }
</style>
```

### 4.2. Client-Side Scripting dalam Astro
- Hindari menyisipkan `<script>` inline raksasa di dalam template komponen.
- Jika butuh logika klien kompleks, buat modul TypeScript terpisah di `src/lib/` atau `src/services/` dan import ke dalam skrip:
  ```astro
  <script>
    import { initQueueListener } from '../services/queueListener';
    initQueueListener();
  </script>
  ```

---

## 5. Standar Penulisan TypeScript

1. **Definisikan Return Type:** Fungsi publik atau fungsi berlogika bisnis wajib mencantumkan return type secara eksplisit.
   ```typescript
   // BAIK
   export function calculateEstimatedTime(queueCount: number): number {
     return queueCount * 5;
   }

   // KURANG BAIK
   export function calculateEstimatedTime(queueCount) {
     return queueCount * 5;
   }
   ```
2. **Hindari `as any` atau Non-null Assertion `!` Tanpa Pengecekan:**
   Gunakan optional chaining (`?.`) dan nullish coalescing (`??`) daripada memaksa compiler mempercayai data undefined.
3. **Zod / Runtime Validation:**
   Untuk payload yang datang dari eksternal (API, form user), gunakan skema validasi runtime (misal Zod) untuk menjamin tipe saat runtime.

---

## 6. Standar PWA (Progressive Web App)

1. **Manifest Synchronization:**
   Setiap perubahan tema warna, nama aplikasi, atau ikon wajib diperbarui sinkron di `astro.config.mjs`, tag `<meta name="theme-color">`, dan manifest.
2. **Offline Resilience:**
   Pastikan aset penting terdaftar pada workbox glob patterns:
   ```javascript
   workbox: {
     navigateFallback: '/',
     globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}']
   }
   ```
3. **PWA Icons:**
   Ikon harus tersedia dalam ukuran minimal 192x192 dan 512x512 PNG, serta `apple-touch-icon.png`.

---

## 7. Standar Pengujian Otomatis (Automated Testing)

1. **Framework:** Vitest dengan environment `node` (menggunakan `getViteConfig` dari `astro/config`).
2. **Komponen Astro Testing:** Gunakan `experimental_AstroContainer` dari `astro/container` untuk menguji output HTML render komponen/halaman.
3. **Struktur Test:**
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { experimental_AstroContainer as AstroContainer } from 'astro/container';
   import MyComponent from '../src/components/MyComponent.astro';

   describe('MyComponent', () => {
     it('renders successfully with provided props', async () => {
       const container = await AstroContainer.create();
       const result = await container.renderToString(MyComponent, {
         props: { title: 'AntriAja' }
       });
       expect(result).toContain('AntriAja');
     });
   });
   ```
4. **Mandatory Test Suite:** Setiap penambahan endpoint, service helper, atau halaman baru wajib menyertakan unit test terkait.

---

## 8. Checklist Pra-Selesai AI Agent (Definition of Done)

Sebelum Agent menyatakan tugas implementasi selesai:
- [ ] Menjalankan `npm run check` dan memastikan tidak ada error TypeScript (`0 errors`).
- [ ] Menjalankan `npm test` dan memastikan semua test case berstatus pass (`✓`).
- [ ] Menjalankan `npm run build` dan memastikan build SSG/SSR berhasil tanpa error bundling.
- [ ] Kode bersih dari console log debug sementara (`console.log('test')`, dump object).
- [ ] Tidak ada file sampah atau temporary files yang tertinggal di working tree.
- [ ] Mematuhi seluruh batasan pada `AGENTS.md`.
