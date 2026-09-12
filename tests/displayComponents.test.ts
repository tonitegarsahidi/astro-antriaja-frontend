import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ActiveCallCard from '../src/components/display/ActiveCallCard.astro';
import RecentCallsList from '../src/components/display/RecentCallsList.astro';
import MediaPromoSlim from '../src/components/display/MediaPromoSlim.astro';
import CountersGrid from '../src/components/display/CountersGrid.astro';
import RunningText from '../src/components/display/RunningText.astro';
import AudioUnlockOverlay from '../src/components/display/AudioUnlockOverlay.astro';
import DisplaySetupModal from '../src/components/display/DisplaySetupModal.astro';
import type { RecentCallItem } from '../src/types/display.types';

describe('Display TV UI Components', () => {
  describe('ActiveCallCard.astro', () => {
    it('renders giant active ticket number, counter name, and service name', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ActiveCallCard, {
        props: {
          ticketNumber: 'A-015',
          counterName: 'Loket 1',
          serviceName: 'Customer Service',
        },
      });

      expect(result).toContain('A-015');
      expect(result).toContain('Loket 1');
      expect(result).toContain('Customer Service');
      expect(result).toContain('active-call-card');
    });

    it('renders fallback placeholder when no active call is present', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ActiveCallCard, {
        props: {
          ticketNumber: '',
          counterName: '',
          serviceName: '',
        },
      });

      expect(result).toContain('---');
      expect(result).toContain('Menunggu Panggilan');
    });
  });

  describe('RecentCallsList.astro', () => {
    it('renders list of recent calls with ticket numbers and destination counters', async () => {
      const recentCalls: RecentCallItem[] = [
        {
          ticket_number: 'A-014',
          counter_name: 'Loket 1',
          counter_number: 1,
          service_name: 'CS',
          service_prefix: 'A',
        },
        {
          ticket_number: 'B-002',
          counter_name: 'Loket 2',
          counter_number: 2,
          service_name: 'Kasir',
          service_prefix: 'B',
        },
      ];

      const container = await AstroContainer.create();
      const result = await container.renderToString(RecentCallsList, {
        props: { recentCalls },
      });

      expect(result).toContain('A-014');
      expect(result).toContain('Loket 1');
      expect(result).toContain('B-002');
      expect(result).toContain('Loket 2');
    });

    it('renders empty message when no recent calls exist', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(RecentCallsList, {
        props: { recentCalls: [] },
      });

      expect(result).toContain('Belum ada riwayat panggilan');
    });
  });

  describe('MediaPromoSlim.astro', () => {
    it('renders video element when mediaType is video and mediaUrl is provided', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(MediaPromoSlim, {
        props: {
          mediaType: 'video',
          mediaUrl: 'https://example.com/promo.mp4',
          tenantName: 'Klinik Sehat',
        },
      });

      expect(result).toContain('<video');
      expect(result).toContain('https://example.com/promo.mp4');
      expect(result).toContain('muted');
      expect(result).toContain('autoplay');
    });

    it('renders img element when mediaType is image and mediaUrl is provided', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(MediaPromoSlim, {
        props: {
          mediaType: 'image',
          mediaUrl: 'https://example.com/banner.jpg',
          tenantName: 'Klinik Sehat',
        },
      });

      expect(result).toContain('<img');
      expect(result).toContain('https://example.com/banner.jpg');
    });

    it('renders tenant placeholder card when mediaType is none or mediaUrl is null', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(MediaPromoSlim, {
        props: {
          mediaType: 'none',
          mediaUrl: null,
          tenantName: 'Klinik Sehat Sentosa',
        },
      });

      expect(result).toContain('Klinik Sehat Sentosa');
      expect(result).toContain('AntriAja Smart Queue');
    });
  });

  describe('CountersGrid.astro', () => {
    it('renders counters grid container with live counters slot', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CountersGrid);

      expect(result).toContain('id="counters-grid"');
      expect(result).toContain('STATUS LOKET');
    });
  });

  describe('RunningText.astro', () => {
    it('renders marquee running text element with provided announcement text', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(RunningText, {
        props: {
          text: 'Harap menjaga ketertiban di ruang tunggu.',
        },
      });

      expect(result).toContain('Harap menjaga ketertiban di ruang tunggu.');
      expect(result).toContain('running-text-content');
    });
  });

  describe('AudioUnlockOverlay.astro', () => {
    it('renders unlock overlay with click instruction to enable audio', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AudioUnlockOverlay);

      expect(result).toContain('id="audio-unlock-overlay"');
      expect(result).toContain('Aktifkan Suara & Layar Penuh');
    });
  });

  describe('DisplaySetupModal.astro', () => {
    it('renders setup modal for configuring display device key and tenant slug', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(DisplaySetupModal);

      expect(result).toContain('id="display-setup-modal"');
      expect(result).toContain('id="setup-display-key"');
      expect(result).toContain('id="btn-save-display-setup"');
    });
  });
});
