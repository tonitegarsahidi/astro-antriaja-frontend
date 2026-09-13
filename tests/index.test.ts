import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import IndexPage from '../src/pages/index.astro';

describe('AntriAja Landing Page (src/pages/index.astro)', () => {
  it('renders landing page shell with brand identity and PWA integration', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(IndexPage);

    // Page title and brand heading
    expect(result).toContain('<title>AntriAja</title>');
    expect(result).toMatch(/<h1[^>]*>.*AntriAja.*<\/h1>/s);

    // PWA & script asset integration
    expect(result).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(result).toContain('<script type="module"');
  });

  it('renders hero section with tagline and primary call-to-actions', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(IndexPage);

    // Hero headline and value proposition
    expect(result).toContain('Manajemen Antrian');
    expect(result).toMatch(/(Paperless|Mandiri|Cerdas)/i);

    // Primary CTA buttons
    expect(result).toContain('href="/kiosk"');
    expect(result).toContain('href="/display"');
  });

  it('renders all 5 core module cards with direct links and comprehensive explanations', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(IndexPage);

    // 1. Kiosk Mandiri
    expect(result).toContain('href="/kiosk"');
    expect(result).toContain('Kiosk');
    expect(result).toMatch(/(tiket|layar sentuh|reguler|VIP)/i);

    // 2. Display TV Ruang Tunggu
    expect(result).toContain('href="/display"');
    expect(result).toContain('Display TV');
    expect(result).toMatch(/(monitor|panggilan|suara|layar)/i);

    // 3. Mobile Pengunjung
    expect(result).toContain('href="/ticket"');
    expect(result).toMatch(/(Mobile Pengunjung|Tiket Mobile)/i);
    expect(result).toMatch(/(smartphone|paperless|QR|pantau)/i);

    // 4. Konsol Petugas Loket (including staff console and staff login links)
    expect(result).toContain('href="/staff"');
    expect(result).toContain('href="/staff/login"');
    expect(result).toMatch(/(Konsol Staf|Petugas Loket)/i);
    expect(result).toMatch(/(panggil|layani|tunda|oper|transfer)/i);

    // 5. Panel Administrasi Cabang (including admin dashboard and admin login links)
    expect(result).toContain('href="/admin"');
    expect(result).toContain('href="/admin/login"');
    expect(result).toMatch(/(Panel Admin|Dashboard Admin|Administrasi)/i);
    expect(result).toMatch(/(layanan|loket|reset|konfigurasi)/i);
  });

  it('renders step-by-step workflow (Cara Kerja) section', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(IndexPage);

    // 4-step workflow keywords
    expect(result).toMatch(/(Alur|Cara Kerja)/i);
    expect(result).toMatch(/(Ambil Tiket|Pilih Layanan)/i);
    expect(result).toMatch(/(Tunggu|Pantau)/i);
    expect(result).toMatch(/(Panggilan Loket|Dipanggil)/i);
    expect(result).toMatch(/(Selesai|Tuntas)/i);
  });

  it('renders informative footer with architecture metadata', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(IndexPage);

    // Footer technology stack info
    expect(result).toContain('Astro');
    expect(result).toContain('Golang');
    expect(result).toContain('PostgreSQL');
  });
});
