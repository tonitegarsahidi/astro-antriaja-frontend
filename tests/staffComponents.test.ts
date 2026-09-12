import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import CurrentServingCard from '../src/components/staff/CurrentServingCard.astro';
import ActionButtonBar from '../src/components/staff/ActionButtonBar.astro';
import WaitingListTab from '../src/components/staff/WaitingListTab.astro';
import HoldListTab from '../src/components/staff/HoldListTab.astro';
import TransferModal from '../src/components/staff/TransferModal.astro';
import CounterSelectorModal from '../src/components/staff/CounterSelectorModal.astro';
import StaffReleaseModal from '../src/components/staff/StaffReleaseModal.astro';

describe('Staff Console UI Components', () => {
  describe('CurrentServingCard.astro', () => {
    it('renders empty/idle state when no ticket is currently active', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CurrentServingCard, {
        props: {
          currentTicket: null,
          counterStatus: 'idle',
        },
      });

      expect(result).toContain('Menunggu Panggilan Antrian');
      expect(result).toContain('current-ticket-card');
    });

    it('renders active ticket details with VIP badge and timer placeholder', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CurrentServingCard, {
        props: {
          currentTicket: {
            id: 'tkt-1',
            tenant_id: 'tnt-456',
            service_id: 'srv-1',
            ticket_number: 'A-012',
            sequence_number: 12,
            service_date: '2026-09-12',
            status: 'serving',
            is_vip: true,
            token: 'tok-123',
            created_at: '2026-09-12T08:00:00Z',
            called_at: '2026-09-12T08:02:00Z',
            served_at: '2026-09-12T08:03:00Z',
          },
          counterStatus: 'serving',
          serviceName: 'Teller / Setoran Tunai',
        },
      });

      expect(result).toContain('A-012');
      expect(result).toContain('PRIORITAS');
      expect(result).toContain('SEDANG DILAYANI');
      expect(result).toContain('id="service-duration-timer"');
    });
  });

  describe('ActionButtonBar.astro', () => {
    it('renders all operation buttons with their appropriate attributes', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ActionButtonBar);

      expect(result).toContain('id="btn-call-next"');
      expect(result).toContain('id="btn-recall"');
      expect(result).toContain('id="btn-serve"');
      expect(result).toContain('id="btn-hold"');
      expect(result).toContain('id="btn-complete"');
      expect(result).toContain('id="btn-transfer"');
      expect(result).toContain('Panggil Berikutnya');
    });
  });

  describe('WaitingListTab.astro', () => {
    it('renders empty waiting queue message when list is empty', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(WaitingListTab, {
        props: {
          tickets: [],
        },
      });

      expect(result).toContain('Tidak ada antrian menunggu');
    });

    it('renders list of waiting tickets with ticket number and VIP badges', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(WaitingListTab, {
        props: {
          tickets: [
            {
              id: 'tkt-1',
              ticket_number: 'A-015',
              is_vip: true,
              created_at: '2026-09-12T08:10:00Z',
            },
            {
              id: 'tkt-2',
              ticket_number: 'A-016',
              is_vip: false,
              created_at: '2026-09-12T08:12:00Z',
            },
          ],
        },
      });

      expect(result).toContain('A-015');
      expect(result).toContain('A-016');
      expect(result).toContain('VIP');
    });
  });

  describe('HoldListTab.astro', () => {
    it('renders empty hold list message when no tickets are on hold', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(HoldListTab, {
        props: {
          tickets: [],
        },
      });

      expect(result).toContain('Tidak ada antrian yang ditunda');
    });

    it('renders held tickets with call-back action button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(HoldListTab, {
        props: {
          tickets: [
            {
              id: 'tkt-hold-1',
              ticket_number: 'A-009',
              is_vip: false,
              created_at: '2026-09-12T08:00:00Z',
            },
          ],
        },
      });

      expect(result).toContain('A-009');
      expect(result).toContain('data-ticket-id="tkt-hold-1"');
      expect(result).toContain('Panggil Kembali');
    });
  });

  describe('TransferModal.astro', () => {
    it('renders transfer modal structure with service selection and action buttons', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(TransferModal);

      expect(result).toContain('id="transfer-modal"');
      expect(result).toContain('Alihkan Antrian');
      expect(result).toContain('id="select-target-service"');
      expect(result).toContain('id="btn-confirm-transfer"');
    });
  });

  describe('CounterSelectorModal.astro', () => {
    it('renders counter selector modal with list container and occupy button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CounterSelectorModal);

      expect(result).toContain('id="counter-selector-modal"');
      expect(result).toContain('Pilih Loket Tugas');
      expect(result).toContain('id="counter-list-container"');
      expect(result).toContain('id="btn-occupy-counter"');
    });
  });

  describe('StaffReleaseModal.astro', () => {
    it('renders release confirmation modal with busy protection warning message', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(StaffReleaseModal);

      expect(result).toContain('id="staff-release-modal"');
      expect(result).toContain('Tinggalkan Loket');
      expect(result).toContain('id="btn-confirm-release"');
    });
  });
});
