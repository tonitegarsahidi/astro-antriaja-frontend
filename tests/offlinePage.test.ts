import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import OfflinePage from '../src/pages/offline.astro';
import OfflineBanner from '../src/components/ui/OfflineBanner.astro';
import BaseLayout from '../src/layouts/BaseLayout.astro';

describe('Offline Resilience Components & Page', () => {
  describe('offline.astro page', () => {
    it('renders offline fallback page with warning message, retry button, and home link', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(OfflinePage);

      expect(result).toContain('Koneksi Terputus');
      expect(result).toContain('id="btn-retry-connection"');
      expect(result).toContain('href="/"');
      expect(result).toContain('mode offline');
    });
  });

  describe('OfflineBanner.astro component', () => {
    it('renders floating offline alert banner with connection warning and retry button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(OfflineBanner);

      expect(result).toContain('id="offline-banner"');
      expect(result).toContain('Koneksi internet terputus');
      expect(result).toContain('id="offline-banner-retry"');
    });
  });

  describe('BaseLayout.astro integration', () => {
    it('embeds global OfflineBanner within base application shell', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(BaseLayout, {
        props: {
          title: 'Test Page',
        },
      });

      expect(result).toContain('id="offline-banner"');
    });
  });
});
