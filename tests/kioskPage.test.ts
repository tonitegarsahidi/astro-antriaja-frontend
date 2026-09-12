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
  });

  it('includes interactive client module script for touch events and SSE sync', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(KioskPage);

    expect(result).toContain('<script type="module"');
  });
});
