import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import KioskPage from '../src/pages/kiosk/index.astro';

describe('Kiosk Touchscreen Page (pages/kiosk/index.astro)', () => {
  it('renders kiosk layout shell and portal container', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(KioskPage);

    expect(result).toContain('<html lang="id">');
    expect(result).toContain('kiosk-viewport');
    expect(result).toContain('Ambil Antrian Anda');
  });

  it('contains semantic elements for client-side touch interaction and real-time updates', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(KioskPage);

    expect(result).toContain('id="service-cards-container"');
    expect(result).toContain('id="kiosk-loading"');
    expect(result).toContain('id="kiosk-error"');
    expect(result).toContain('id="btn-open-vip-modal"');
    expect(result).toContain('id="kiosk-clock"');
    expect(result).toContain('id="kiosk-setup-modal"');
  });

  it('renders bottom-left settings icon button with logout, fullscreen, and theme toggles', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(KioskPage);

    expect(result).toContain('id="btn-device-settings"');
    expect(result).toContain('id="device-settings-menu"');
    expect(result).toContain('id="btn-menu-logout"');
    expect(result).toContain('id="btn-menu-fullscreen"');
    expect(result).toContain('id="btn-menu-theme"');
  });

  it('includes interactive client module script for touch events and SSE sync', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(KioskPage);

    expect(result).toContain('<script type="module"');
  });

  it('renders resilient error recovery controls with retry and config action buttons', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(KioskPage);

    expect(result).toContain('id="kiosk-error"');
    expect(result).toContain('id="kiosk-error-title"');
    expect(result).toContain('id="kiosk-error-message"');
    expect(result).toContain('id="btn-kiosk-retry"');
    expect(result).toContain('id="btn-open-config"');
    expect(result).toContain('Coba Lagi');
    expect(result).toContain('Ubah Konfigurasi');
  });

  it('verifies that astro.config.mjs pre-bundles qrcode via vite.optimizeDeps to prevent 504 errors', async () => {
    const astroConfigModule = await import('../astro.config.mjs');
    const astroConfig = astroConfigModule.default;
    expect(astroConfig.vite).toBeDefined();
    expect(astroConfig.vite?.optimizeDeps).toBeDefined();
    expect(astroConfig.vite?.optimizeDeps?.include).toContain('qrcode');
  });
});

