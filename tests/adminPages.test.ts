import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AdminLayout from '../src/layouts/AdminLayout.astro';
import AdminLoginPage from '../src/pages/admin/login.astro';
import AdminIndexPage from '../src/pages/admin/index.astro';
import AdminServicesPage from '../src/pages/admin/services.astro';
import AdminCountersPage from '../src/pages/admin/counters.astro';
import AdminDisplayPage from '../src/pages/admin/display.astro';

describe('Admin Pages & Layouts', () => {
  describe('AdminLayout.astro', () => {
    it('renders sidebar navigation, brand logo, admin role badge, mobile toggle, and logout button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminLayout, {
        props: {
          title: 'Panel Administrasi - AntriAja',
          activePage: 'dashboard',
        },
      });

      expect(result).toContain('AntriAja');
      expect(result).toContain('ADMINISTRATOR');
      expect(result).toContain('href="/admin"');
      expect(result).toContain('href="/admin/services"');
      expect(result).toContain('href="/admin/counters"');
      expect(result).toContain('href="/admin/display"');
      expect(result).toContain('href="/admin/users"');
      expect(result).toContain('href="/admin/settings"');
      expect(result).toContain('id="btn-toggle-mobile-sidebar"');
      expect(result).toContain('id="admin-sidebar-backdrop"');
      expect(result).toContain('id="btn-trigger-reset-modal"');
      expect(result).toContain('id="btn-admin-logout"');
      expect(result).toContain('Keluar / Logout');
      expect(result).toContain('Navigasi Utama');
      expect(result).toContain('Operasional Antrian');
      expect(result).toContain('Pengaturan &amp; Sistem');
    });
  });

  describe('admin/login.astro', () => {
    it('renders admin login form with form inputs, demo helper, password toggle, and role switcher', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminLoginPage);

      expect(result).toContain('Login Administrator');
      expect(result).toContain('id="admin-login-form"');
      expect(result).toContain('id="input-tenant-slug"');
      expect(result).toContain('id="input-email"');
      expect(result).toContain('id="input-password"');
      expect(result).toContain('id="btn-admin-login-submit"');
      expect(result).toContain('id="btn-quick-fill-demo"');
      expect(result).toContain('id="btn-toggle-password"');
      expect(result).toContain('href="/staff/login"');
    });
  });

  describe('admin/index.astro', () => {
    it('renders admin dashboard overview with stat cards and quick action links', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminIndexPage);

      expect(result).toContain('Ringkasan Operasional Cabang');
      expect(result).toContain('id="stat-services-count"');
      expect(result).toContain('id="stat-counters-count"');
      expect(result).toContain('id="stat-staff-count"');
      expect(result).toContain('id="stat-waiting-count"');
    });
  });

  describe('admin/services.astro', () => {
    it('renders service master management page with table and add service button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminServicesPage);

      expect(result).toContain('Manajemen Kategori Layanan');
      expect(result).toContain('id="btn-add-service"');
      expect(result).toContain('id="services-table-container"');
    });
  });

  describe('admin/counters.astro', () => {
    it('renders counter master management page with counter grid/table and add counter button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminCountersPage);

      expect(result).toContain('Manajemen Meja Loket');
      expect(result).toContain('id="btn-add-counter"');
      expect(result).toContain('id="counters-container"');
    });
  });

  describe('admin/display.astro', () => {
    it('renders TV display settings form with running text, media type, preview card, and device key section', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminDisplayPage);

      expect(result).toContain('Pengaturan Tampilan Smart TV');
      expect(result).toContain('id="input-running-text"');
      expect(result).toContain('id="select-media-type"');
      expect(result).toContain('id="input-media-url"');
      expect(result).toContain('id="toggle-voice-enabled"');
      expect(result).toContain('id="btn-save-display-settings"');
      expect(result).toContain('id="display-preview-card"');

      // Display Device Key Management Section
      expect(result).toContain('Display Device Key');
      expect(result).toContain('id="input-display-device-key"');
      expect(result).toContain('id="btn-copy-device-key"');
      expect(result).toContain('id="btn-save-device-key"');
    });
  });
});
