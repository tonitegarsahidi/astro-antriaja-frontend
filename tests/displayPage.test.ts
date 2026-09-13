import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DisplayIndexPage from '../src/pages/display/index.astro';

describe('Display TV Page (/display)', () => {
  it('renders fullscreen 16:9 layout structure with split-screen zones', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DisplayIndexPage);

    // Memastikan kontainer utama display ada
    expect(result).toContain('display-layout');
    expect(result).toContain('id="display-main-content"');

    // Memastikan zona kiri (Active Call & Recent Calls)
    expect(result).toContain('id="active-call-section"');
    expect(result).toContain('id="recent-calls-section"');

    // Memastikan zona kanan (Media Promosi & Grid Loket)
    expect(result).toContain('id="media-promo-section"');
    expect(result).toContain('id="counters-grid"');

    // Memastikan footer running text
    expect(result).toContain('id="running-text-marquee"');
  });

  it('renders bottom-left settings icon button with logout, fullscreen, and theme toggles', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DisplayIndexPage);

    expect(result).toContain('id="btn-device-settings"');
    expect(result).toContain('id="device-settings-menu"');
    expect(result).toContain('id="btn-menu-logout"');
    expect(result).toContain('id="btn-menu-fullscreen"');
    expect(result).toContain('id="btn-menu-theme"');
  });

  it('renders audio unlock splash overlay and mandatory device key setup modal', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DisplayIndexPage);

    expect(result).toContain('id="audio-unlock-overlay"');
    expect(result).toContain('id="display-setup-modal"');
    expect(result).toContain('id="setup-display-key"');
    expect(result).toMatch(/required/i);
  });

  it('includes client orchestration script for SSE connection and audio playback', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DisplayIndexPage);

    expect(result).toContain('id="sse-status-badge"');
    expect(result).toContain('id="digital-clock"');
  });
});
