import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StaffLayout from '../src/layouts/StaffLayout.astro';
import AdminLayout from '../src/layouts/AdminLayout.astro';

describe('Sidebar Navigation (Staff & Admin Layouts)', () => {
  describe('StaffLayout.astro - Left Sidebar & Mobile Drawer', () => {
    it('renders left permanent sidebar with brand, staff profile, active counter card, shift stats, action buttons, and logout', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(StaffLayout, {
        props: {
          title: 'Konsol Staf Loket - AntriAja',
        },
      });

      // Brand & Context Badge
      expect(result).toContain('AntriAja');
      expect(result).toContain('Konsol Staf');

      // Staff Profile Widget
      expect(result).toContain('id="sidebar-staff-name"');
      expect(result).toContain('id="sidebar-staff-tenant"');
      expect(result).toContain('id="sidebar-staff-avatar"');

      // Active Counter Info Card
      expect(result).toContain('id="sidebar-counter-name"');
      expect(result).toContain('id="sidebar-counter-status"');
      expect(result).toContain('id="sidebar-counter-services"');

      // Shift Stats Widget
      expect(result).toContain('id="sidebar-served-count"');
      expect(result).toContain('id="sidebar-avg-time"');

      // Shift Operational Action Buttons
      expect(result).toContain('id="sidebar-btn-change-counter"');
      expect(result).toContain('id="sidebar-btn-release-counter"');

      // Logout Action
      expect(result).toContain('id="sidebar-btn-logout"');
      expect(result).toContain('Keluar / Logout');

      // Mobile Toggle & Slide-Over Drawer Elements
      expect(result).toContain('id="btn-toggle-staff-sidebar"');
      expect(result).toContain('id="staff-sidebar-backdrop"');
      expect(result).toContain('id="btn-close-staff-sidebar"');
      expect(result).toContain('id="staff-sidebar"');
    });
  });

  describe('AdminLayout.astro - Permanent Desktop & Mobile Slide-Over', () => {
    it('maintains consistent permanent desktop sidebar and mobile slide-over toggle', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminLayout, {
        props: {
          title: 'Panel Administrasi - AntriAja',
          activePage: 'dashboard',
        },
      });

      expect(result).toContain('id="admin-sidebar"');
      expect(result).toContain('id="btn-toggle-mobile-sidebar"');
      expect(result).toContain('id="admin-sidebar-backdrop"');
      expect(result).toContain('id="btn-close-mobile-sidebar"');
      expect(result).toContain('id="btn-admin-logout"');
    });
  });
});
