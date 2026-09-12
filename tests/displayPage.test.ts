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

  it('renders audio unlock splash overlay and device key setup modal', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DisplayIndexPage);

    expect(result).toContain('id="audio-unlock-overlay"');
    expect(result).toContain('id="display-setup-modal"');
  });

  it('includes client orchestration script for SSE connection and audio playback', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DisplayIndexPage);

    expect(result).toContain('id="sse-status-badge"');
    expect(result).toContain('id="digital-clock"');
  });
});
