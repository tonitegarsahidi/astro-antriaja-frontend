import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StaffLayout from '../src/layouts/StaffLayout.astro';
import StaffLoginPage from '../src/pages/staff/login.astro';
import StaffIndexPage from '../src/pages/staff/index.astro';

describe('Staff Pages & Layouts', () => {
  describe('StaffLayout.astro', () => {
    it('renders header, counter status badge, digital clock, SSE indicator, and logout button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(StaffLayout, {
        props: {
          title: 'Konsol Staf Loket - AntriAja',
        },
      });

      expect(result).toContain('AntriAja');
      expect(result).toContain('Konsol Staf');
      expect(result).toContain('id="staff-counter-badge"');
      expect(result).toContain('id="staff-clock"');
      expect(result).toContain('id="sse-status-badge"');
      expect(result).toContain('id="btn-release-counter"');
      expect(result).toContain('id="btn-logout"');
    });
  });

  describe('staff/login.astro', () => {
    it('renders staff login page with form inputs, demo helper, password toggle, and role switcher', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(StaffLoginPage);

      expect(result).toContain('Login Petugas Loket');
      expect(result).toContain('id="input-tenant-slug"');
      expect(result).toContain('id="input-email"');
      expect(result).toContain('id="input-password"');
      expect(result).toContain('id="btn-login-submit"');
      expect(result).toContain('id="btn-quick-fill-demo"');
      expect(result).toContain('id="btn-toggle-password"');
      expect(result).toContain('href="/admin/login"');
    });
  });

  describe('staff/index.astro', () => {
    it('renders operational console dashboard with tabs, current serving card, and action bar', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(StaffIndexPage);

      expect(result).toContain('Konsol Loket');
      expect(result).toContain('current-ticket-card');
      expect(result).toContain('id="btn-call-next"');
      expect(result).toContain('Antrian Menunggu');
      expect(result).toContain('Daftar Tunda');
      expect(result).toContain('counter-selector-modal');
    });
  });
});
