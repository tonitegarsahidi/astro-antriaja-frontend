import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StaffFormModal from '../src/components/admin/StaffFormModal.astro';
import AdminUsersPage from '../src/pages/admin/users.astro';
import AdminSettingsPage from '../src/pages/admin/settings.astro';
import * as tenantService from '../src/services/tenantService';
import * as userService from '../src/services/userService';

describe('Fase A (Frontend): Tenant Settings & Staff Management', () => {
  describe('StaffFormModal.astro', () => {
    it('renders staff form modal with all required inputs and action buttons', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(StaffFormModal);

      expect(result).toContain('id="staff-form-modal"');
      expect(result).toContain('id="modal-staff-title"');
      expect(result).toContain('id="staff-form"');
      expect(result).toContain('id="input-staff-name"');
      expect(result).toContain('id="input-staff-email"');
      expect(result).toContain('id="input-staff-password"');
      expect(result).toContain('id="toggle-staff-active"');
      expect(result).toContain('id="btn-staff-submit"');
      expect(result).toContain('id="btn-staff-cancel"');
    });
  });

  describe('admin/users.astro', () => {
    it('renders staff management page with table container, add button, and stat badges', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminUsersPage);

      expect(result).toContain('Manajemen Petugas Staf');
      expect(result).toContain('id="btn-add-staff"');
      expect(result).toContain('id="users-table-container"');
      expect(result).toContain('id="stat-total-staff"');
      expect(result).toContain('id="stat-active-staff"');
      expect(result).toContain('id="modal-deactivate-confirm"');
    });
  });

  describe('admin/settings.astro', () => {
    it('renders tenant settings page with profile, queue rules, and device key rotation sections', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminSettingsPage);

      expect(result).toContain('Pengaturan Instansi & Antrian');

      // 1. Profil Instansi Section
      expect(result).toContain('id="input-tenant-name"');
      expect(result).toContain('id="input-tenant-phone"');
      expect(result).toContain('id="input-tenant-address"');
      expect(result).toContain('id="select-tenant-timezone"');
      expect(result).toContain('id="input-tenant-logo-url"');
      expect(result).toContain('id="btn-save-profile"');

      // 2. Aturan Antrian Section
      expect(result).toContain('id="input-daily-reset-time"');
      expect(result).toContain('id="radio-transfer-priority"');
      expect(result).toContain('id="radio-transfer-keep"');
      expect(result).toContain('id="input-new-vip-pin"');
      expect(result).toContain('id="btn-save-queue-settings"');

      // 3. Device Keys & Rotation Section
      expect(result).toContain('id="input-kiosk-key"');
      expect(result).toContain('id="btn-copy-kiosk-key"');
      expect(result).toContain('id="btn-rotate-kiosk-key"');
      expect(result).toContain('id="input-display-key"');
      expect(result).toContain('id="btn-copy-display-key"');
      expect(result).toContain('id="btn-rotate-display-key"');
      expect(result).toContain('id="modal-rotate-confirm"');
    });

    it('renders logo upload controls, file input, and logo preview container in admin/settings.astro', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminSettingsPage);

      expect(result).toContain('id="tab-logo-upload"');
      expect(result).toContain('id="tab-logo-url"');
      expect(result).toContain('id="input-tenant-logo-file"');
      expect(result).toContain('id="input-tenant-logo-url"');
      expect(result).toContain('id="logo-preview-box"');
      expect(result).toContain('id="logo-preview-img"');
      expect(result).toContain('id="btn-remove-logo"');
    });
  });

  describe('Service Layer Contracts', () => {
    it('exports all required functions for tenantService and userService', () => {
      expect(typeof tenantService.getTenantProfile).toBe('function');
      expect(typeof tenantService.updateTenantProfile).toBe('function');
      expect(typeof tenantService.rotateDeviceKey).toBe('function');

      expect(typeof userService.listStaff).toBe('function');
      expect(typeof userService.getStaff).toBe('function');
      expect(typeof userService.createStaff).toBe('function');
      expect(typeof userService.updateStaff).toBe('function');
      expect(typeof userService.deactivateStaff).toBe('function');
    });
  });
});
