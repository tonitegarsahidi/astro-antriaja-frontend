import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ResetConfirmModal from '../src/components/admin/ResetConfirmModal.astro';
import ServiceFormModal from '../src/components/admin/ServiceFormModal.astro';
import CounterFormModal from '../src/components/admin/CounterFormModal.astro';

describe('Admin UI Components', () => {
  describe('ResetConfirmModal.astro', () => {
    it('renders reset confirmation modal with type-to-confirm input and warning notice', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ResetConfirmModal);

      expect(result).toContain('id="reset-confirm-modal"');
      expect(result).toContain('Reset Antrian Harian');
      expect(result).toContain('id="input-confirm-reset"');
      expect(result).toContain('id="btn-execute-reset"');
      expect(result).toContain('id="btn-cancel-reset"');
    });
  });

  describe('ServiceFormModal.astro', () => {
    it('renders service form modal with name, prefix, duration inputs and active toggle', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ServiceFormModal);

      expect(result).toContain('id="service-form-modal"');
      expect(result).toContain('Kategori Layanan');
      expect(result).toContain('id="input-service-name"');
      expect(result).toContain('id="input-service-prefix"');
      expect(result).toContain('id="input-service-duration"');
      expect(result).toContain('id="input-service-active"');
      expect(result).toContain('id="btn-save-service"');
    });

    it('renders image upload controls, url input, and image preview container in ServiceFormModal', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(ServiceFormModal);

      expect(result).toContain('id="input-service-image-url"');
      expect(result).toContain('id="input-service-image-file"');
      expect(result).toContain('id="service-image-preview-box"');
      expect(result).toContain('id="btn-remove-service-image"');
    });
  });

  describe('CounterFormModal.astro', () => {
    it('renders counter form modal with counter number, name, and service assignment container', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(CounterFormModal);

      expect(result).toContain('id="counter-form-modal"');
      expect(result).toContain('Loket Fisik');
      expect(result).toContain('id="input-counter-number"');
      expect(result).toContain('id="input-counter-name"');
      expect(result).toContain('id="counter-services-selection"');
      expect(result).toContain('id="btn-save-counter"');
    });
  });
});
