import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import KioskLayout from '../src/layouts/KioskLayout.astro';
import ServiceCard from '../src/components/kiosk/ServiceCard.astro';
import VIPModal from '../src/components/kiosk/VIPModal.astro';
import TicketModal from '../src/components/kiosk/TicketModal.astro';
import ThermalReceipt from '../src/components/kiosk/ThermalReceipt.astro';
import KioskSetupModal from '../src/components/kiosk/KioskSetupModal.astro';

describe('Kiosk UI Components', () => {
  describe('KioskLayout.astro', () => {
    it('renders header logo container, logo image element, and fallback bank emoji', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(KioskLayout, {
        props: {
          title: 'Kiosk Mandiri',
          tenantName: 'Puskesmas Maju Jaya',
        },
      });

      expect(result).toContain('id="kiosk-tenant-logo"');
      expect(result).toContain('id="kiosk-tenant-logo-img"');
      expect(result).toContain('id="kiosk-tenant-logo-fallback"');
      expect(result).toContain('🏛️');
      expect(result).toContain('Puskesmas Maju Jaya');
    });
  });
  describe('ServiceCard.astro', () => {
    it('renders service name, prefix badge, duration, and waiting count', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ServiceCard, {
        props: {
          id: 'srv-1',
          name: 'Teller / Setoran Tunai',
          prefix: 'A',
          estimatedDurationMins: 5,
          waitingCount: 4,
        },
      });

      expect(result).toContain('Teller / Setoran Tunai');
      expect(result).toContain('A');
      expect(result).toContain('4');
      expect(result).toContain('data-service-id="srv-1"');
    });

    it('renders service image container above service title when imageUrl is provided', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ServiceCard, {
        props: {
          id: 'srv-2',
          name: 'Customer Service',
          prefix: 'B',
          estimatedDurationMins: 10,
          waitingCount: 2,
          imageUrl: '/uploads/images/cs-icon.png',
        },
      });

      expect(result).toContain('class="service-image-box"');
      expect(result).toContain('src="http://localhost:8080/uploads/images/cs-icon.png"');
      expect(result).toContain('alt="Customer Service"');
    });
  });

  describe('VIPModal.astro', () => {
    it('renders numeric keypad 0-9, pin display dots, and backspace button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(VIPModal);

      expect(result).toContain('Jalur Khusus / Prioritas');
      expect(result).toContain('data-key="1"');
      expect(result).toContain('data-key="9"');
      expect(result).toContain('data-key="0"');
      expect(result).toContain('data-action="backspace"');
      expect(result).toContain('pin-display');
    });
  });

  describe('TicketModal.astro', () => {
    it('renders ticket modal with ticket number and auto-close countdown', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(TicketModal);

      expect(result).toContain('TIKET BERHASIL DITERBITKAN');
      expect(result).toContain('id="modal-ticket-number"');
      expect(result).toContain('id="qr-code-canvas"');
      expect(result).toContain('id="btn-print-receipt"');
      expect(result).toContain('id="countdown-timer"');
    });
  });

  describe('ThermalReceipt.astro', () => {
    it('renders print receipt structure formatted for 58mm/80mm thermal printers', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ThermalReceipt);

      expect(result).toContain('thermal-receipt');
      expect(result).toContain('id="thermal-ticket-number"');
      expect(result).toContain('id="thermal-qr-code"');
      expect(result).toContain('id="thermal-service-name"');
      expect(result).toContain('Harap menunggu panggilan nomor Anda');
    });
  });

  describe('KioskSetupModal.astro', () => {
    it('renders kiosk setup form with slug and device key fields', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(KioskSetupModal);

      expect(result).toContain('Konfigurasi Kiosk');
      expect(result).toContain('id="input-kiosk-slug"');
      expect(result).toContain('id="input-kiosk-key"');
      expect(result).toContain('id="btn-save-kiosk-setup"');
    });
  });
});
