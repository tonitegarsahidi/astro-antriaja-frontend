import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StaffLayout from '../src/layouts/StaffLayout.astro';
import AdminLayout from '../src/layouts/AdminLayout.astro';
import CounterSelectorModal from '../src/components/staff/CounterSelectorModal.astro';
import StaffReleaseModal from '../src/components/staff/StaffReleaseModal.astro';
import TransferModal from '../src/components/staff/TransferModal.astro';

describe('Sidebar Navigation (Staff & Admin Layouts)', () => {
  describe('StaffLayout.astro - Left Sidebar & Mobile Drawer', () => {
    it('renders left permanent sidebar with brand, staff profile, interactive counter card, navigation menus, shift stats, action buttons, and logout', async () => {
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

      // Interactive Active Counter Card
      expect(result).toContain('id="sidebar-counter-card"');
      expect(result).toContain('id="sidebar-counter-name"');
      expect(result).toContain('id="sidebar-counter-status"');
      expect(result).toContain('id="sidebar-counter-services"');

      // Staff Navigational Menus
      expect(result).toContain('id="sidebar-nav-console"');
      expect(result).toContain('id="sidebar-nav-waiting"');
      expect(result).toContain('id="sidebar-nav-hold"');
      expect(result).toContain('id="sidebar-nav-waiting-badge"');
      expect(result).toContain('id="sidebar-nav-hold-badge"');

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

  describe('Modal Z-Index Stacking Context', () => {
    it('ensures all staff operational modals have higher z-index (z-[70]) than the sidebar (z-50)', async () => {
      const container = await AstroContainer.create();

      const counterSelectorHtml = await container.renderToString(CounterSelectorModal);
      expect(counterSelectorHtml).toContain('z-[70]');

      const staffReleaseHtml = await container.renderToString(StaffReleaseModal);
      expect(staffReleaseHtml).toContain('z-[70]');

      const transferHtml = await container.renderToString(TransferModal);
      expect(transferHtml).toContain('z-[70]');
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
