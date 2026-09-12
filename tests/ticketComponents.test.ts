import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TicketHeroStatus from '../src/components/ticket/TicketHeroStatus.astro';
import QueueProgress from '../src/components/ticket/QueueProgress.astro';
import CounterInfoCard from '../src/components/ticket/CounterInfoCard.astro';
import CallingAlert from '../src/components/ticket/CallingAlert.astro';

describe('Ticket UI Components', () => {
  describe('TicketHeroStatus.astro', () => {
    it('renders ticket number, service name, and waiting status badge', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(TicketHeroStatus, {
        props: {
          ticketNumber: 'A-005',
          serviceName: 'Teller / Setoran Tunai',
          status: 'waiting',
          isVip: false,
        },
      });

      expect(result).toContain('A-005');
      expect(result).toContain('Teller / Setoran Tunai');
      expect(result).toContain('Menunggu');
      expect(result).not.toContain('badge-vip');
    });

    it('renders VIP badge when isVip is true', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(TicketHeroStatus, {
        props: {
          ticketNumber: 'B-001',
          serviceName: 'Customer Service',
          status: 'called',
          isVip: true,
        },
      });

      expect(result).toContain('B-001');
      expect(result).toContain('Dipanggil');
      expect(result).toContain('VIP');
    });

    it('renders appropriate text for different ticket statuses', async () => {
      const container = await AstroContainer.create();

      const servingResult = await container.renderToString(TicketHeroStatus, {
        props: {
          ticketNumber: 'A-002',
          serviceName: 'Teller',
          status: 'serving',
        },
      });
      expect(servingResult).toContain('Sedang Dilayani');

      const holdResult = await container.renderToString(TicketHeroStatus, {
        props: {
          ticketNumber: 'A-003',
          serviceName: 'Teller',
          status: 'hold',
        },
      });
      expect(holdResult).toContain('Ditunda');

      const completedResult = await container.renderToString(TicketHeroStatus, {
        props: {
          ticketNumber: 'A-004',
          serviceName: 'Teller',
          status: 'completed',
        },
      });
      expect(completedResult).toContain('Selesai');
    });
  });

  describe('QueueProgress.astro', () => {
    it('renders queue count ahead and estimated wait time', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(QueueProgress, {
        props: {
          queueAheadCount: 4,
          estimatedWaitMins: 20,
        },
      });

      expect(result).toContain('4');
      expect(result).toContain('20 menit');
    });

    it('displays "Giliran Anda Berikutnya!" when queueAheadCount is 0', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(QueueProgress, {
        props: {
          queueAheadCount: 0,
          estimatedWaitMins: 0,
        },
      });

      expect(result).toContain('Giliran Anda Berikutnya');
    });
  });

  describe('CounterInfoCard.astro', () => {
    it('renders counter destination name when counter is assigned', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CounterInfoCard, {
        props: {
          counterNumber: 1,
          counterName: 'Loket 1 (Teller)',
        },
      });

      expect(result).toContain('Loket 1 (Teller)');
      expect(result).toContain('Silakan menuju ke:');
    });

    it('renders hidden or waiting placeholder when counter is not assigned yet', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CounterInfoCard, {
        props: {},
      });

      expect(result).toContain('counter-info-empty');
    });
  });

  describe('CallingAlert.astro', () => {
    it('renders calling alert container structure', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CallingAlert, {
        props: {
          visible: true,
          ticketNumber: 'A-005',
          counterName: 'Loket 1',
        },
      });

      expect(result).toContain('NOMOR ANDA DIPANGGIL!');
      expect(result).toContain('A-005');
      expect(result).toContain('Loket 1');
    });
  });
});
