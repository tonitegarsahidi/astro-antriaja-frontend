// @ts-check
import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

/** @type {import('@vite-pwa/astro').PwaOptions} */
export const pwaOptions = {
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  manifest: {
    name: 'AntriAja - Sistem Antrian Modern',
    short_name: 'AntriAja',
    description: 'Sistem Manajemen Antrian Cloud Mandiri, Cepat, dan Realtime',
    theme_color: '#2563eb',
    background_color: '#f8fafc',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Kiosk Mandiri',
        short_name: 'Kiosk',
        description: 'Ambil tiket antrian di kiosk pintu masuk',
        url: '/kiosk',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Layar Display TV',
        short_name: 'Display TV',
        description: 'Tampilan monitor panggilan ruang tunggu',
        url: '/display',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Konsol Staf Loket',
        short_name: 'Staf',
        description: 'Konsol operasional pelayanan staf loket',
        url: '/staff',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Panel Administrasi',
        short_name: 'Admin',
        description: 'Pengaturan layanan, loket, dan sistem cabang',
        url: '/admin',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
    ],
  },
  workbox: {
    navigateFallback: '/offline',
    navigateFallbackDenylist: [/^\/api/, /^\/@/, /^\/node_modules/, /^\/src/],
    globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'antriaja-images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'antriaja-static-assets',
        },
      },
    ],
  },
  devOptions: {
    enabled: false,
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [AstroPWA(pwaOptions)],
});
