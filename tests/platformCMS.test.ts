import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PlatformLayout from '../src/layouts/PlatformLayout.astro';
import PlatformLoginPage from '../src/pages/platform/login.astro';
import PlatformDashboardPage from '../src/pages/platform/index.astro';
import PlatformTenantsPage from '../src/pages/platform/tenants.astro';
import PlatformAnalyticsPage from '../src/pages/platform/analytics.astro';
import {
  platformLogin,
  getPlatformMe,
  getPlatformMetrics,
  getPlatformTicketAnalytics,
  listPlatformTenants,
  getPlatformTenant,
  createPlatformTenant,
  updatePlatformTenantStatus,
  rotatePlatformDeviceKey,
  deletePlatformTenant,
} from '../src/services/platformService';
import {
  getPlatformToken,
  setPlatformToken,
  removePlatformToken,
} from '../src/lib/storage';
import type {
  PlatformLoginRequest,
  PlatformLoginResponse,
  PlatformMetricsResponse,
  PlatformTenantListItem,
  PlatformTenantDetailResponse,
  CreatePlatformTenantRequest,
} from '../src/types/platform.types';

describe('Modul C3: Platform Super-Admin CMS Dashboard', () => {
  const mockStorage = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, val: string) => {
      mockStorage.set(key, String(val));
    },
    removeItem: (key: string) => {
      mockStorage.delete(key);
    },
    clear: () => {
      mockStorage.clear();
    },
  };

  beforeEach(() => {
    (globalThis as any).window = globalThis;
    (globalThis as any).localStorage = mockLocalStorage;
    mockLocalStorage.clear();
  });

  describe('Storage: Platform Token Isolation', () => {
    it('manages platform token in isolated antriaja_platform_token key without colliding with tenant token', () => {
      expect(getPlatformToken()).toBeNull();

      setPlatformToken('plat-jwt-superadmin-secret-token');
      expect(getPlatformToken()).toBe('plat-jwt-superadmin-secret-token');
      expect(localStorage.getItem('antriaja_platform_token')).toBe('plat-jwt-superadmin-secret-token');
      expect(localStorage.getItem('antriaja_token')).toBeNull();

      removePlatformToken();
      expect(getPlatformToken()).toBeNull();
      expect(localStorage.getItem('antriaja_platform_token')).toBeNull();
    });
  });

  describe('platformService API Client', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.restoreAllMocks();
      setPlatformToken('mock-platform-jwt-token');
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
      removePlatformToken();
    });

    it('platformLogin: calls POST /platform/auth/login and returns admin with JWT', async () => {
      const mockLoginReq: PlatformLoginRequest = {
        email: 'superadmin@antriaja.com',
        password: 'PasswordSuperAman123!',
      };

      const mockLoginRes: PlatformLoginResponse = {
        token: 'mock-platform-jwt-token',
        admin: {
          id: 'plat-adm-1',
          email: 'superadmin@antriaja.com',
          full_name: 'Platform Super Admin',
          role: 'superadmin',
          is_active: true,
          created_at: '2026-09-13T00:00:00Z',
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockLoginRes,
          error: null,
        }),
      });

      const res = await platformLogin(mockLoginReq);

      expect(res.success).toBe(true);
      expect(res.data?.token).toBe('mock-platform-jwt-token');
      expect(res.data?.admin.role).toBe('superadmin');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockLoginReq),
        })
      );
    });

    it('getPlatformMe: calls GET /platform/auth/me with Authorization Bearer header', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            id: 'plat-adm-1',
            email: 'superadmin@antriaja.com',
            full_name: 'Platform Super Admin',
            role: 'superadmin',
            is_active: true,
          },
          error: null,
        }),
      });

      const res = await getPlatformMe();

      expect(res.success).toBe(true);
      expect(res.data?.email).toBe('superadmin@antriaja.com');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/auth/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-platform-jwt-token',
          }),
        })
      );
    });

    it('getPlatformMetrics: calls GET /platform/metrics and returns system counters', async () => {
      const mockMetrics: PlatformMetricsResponse = {
        total_tenants: 25,
        active_tenants: 22,
        suspended_tenants: 2,
        trial_tenants: 1,
        total_tickets_today: 1450,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockMetrics,
          error: null,
        }),
      });

      const res = await getPlatformMetrics();

      expect(res.success).toBe(true);
      expect(res.data?.total_tenants).toBe(25);
      expect(res.data?.active_tenants).toBe(22);
      expect(res.data?.total_tickets_today).toBe(1450);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/metrics'),
        expect.anything()
      );
    });

    it('listPlatformTenants: calls GET /platform/tenants with pagination & filters', async () => {
      const mockTenantList: PlatformTenantListItem[] = [
        {
          id: 'tnt-001',
          name: 'Klinik Medika',
          slug: 'klinik-medika',
          status: 'active',
          phone: '08123456789',
          address: 'Jl. Sudirman No. 1',
          timezone: 'Asia/Jakarta',
          created_at: '2026-09-13T00:00:00Z',
          total_tickets_today: 120,
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            tenants: mockTenantList,
            pagination: {
              page: 1,
              limit: 10,
              total_items: 1,
              total_pages: 1,
            },
          },
          error: null,
        }),
      });

      const res = await listPlatformTenants({ page: 1, limit: 10, search: 'medika', status: 'active' });

      expect(res.success).toBe(true);
      expect(res.data?.tenants).toHaveLength(1);
      expect(res.data?.tenants[0].slug).toBe('klinik-medika');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/platform\/tenants\?.*page=1.*limit=10.*search=medika.*status=active/),
        expect.anything()
      );
    });

    it('getPlatformTenant: calls GET /platform/tenants/:id and returns details with live stats', async () => {
      const mockDetail: PlatformTenantDetailResponse = {
        tenant: {
          id: 'tnt-001',
          name: 'Klinik Medika',
          slug: 'klinik-medika',
          kiosk_key: 'kiosk-key-hash',
          display_key: 'display-key-hash',
          transfer_ticket_mode: 'new_number_priority',
          daily_reset_time: '00:00:00',
          status: 'active',
          phone: '08123456789',
          address: 'Jl. Sudirman No. 1',
          timezone: 'Asia/Jakarta',
          created_at: '2026-09-13T00:00:00Z',
        },
        stats: {
          total_staff: 5,
          total_services: 3,
          total_counters: 2,
          total_tickets_today: 120,
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockDetail,
          error: null,
        }),
      });

      const res = await getPlatformTenant('tnt-001');

      expect(res.success).toBe(true);
      expect(res.data?.tenant.id).toBe('tnt-001');
      expect(res.data?.stats.total_tickets_today).toBe(120);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/tenants/tnt-001'),
        expect.anything()
      );
    });

    it('createPlatformTenant: calls POST /platform/tenants with provisioning payload', async () => {
      const mockReq: CreatePlatformTenantRequest = {
        name: 'RS Siloam Baru',
        slug: 'rs-siloam-baru',
        admin_email: 'admin@siloam.com',
        admin_password: 'PasswordSiloam123!',
        admin_name: 'Direktur Utama',
        phone: '08119876543',
        address: 'Jl. TB Simatupang',
        timezone: 'Asia/Jakarta',
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: {
            tenant: {
              id: 'tnt-new-99',
              name: 'RS Siloam Baru',
              slug: 'rs-siloam-baru',
              status: 'active',
            },
          },
          error: null,
        }),
      });

      const res = await createPlatformTenant(mockReq);

      expect(res.success).toBe(true);
      expect(res.data?.tenant.slug).toBe('rs-siloam-baru');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/tenants'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockReq),
        })
      );
    });

    it('updatePlatformTenantStatus: calls PUT /platform/tenants/:id/status to suspend or activate', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            message: 'Status tenant berhasil diperbarui',
            tenant_id: 'tnt-001',
            status: 'suspended',
          },
          error: null,
        }),
      });

      const res = await updatePlatformTenantStatus('tnt-001', 'suspended');

      expect(res.success).toBe(true);
      expect(res.data?.status).toBe('suspended');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/tenants/tnt-001/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            status: 'suspended',
          }),
        })
      );
    });

    it('rotatePlatformDeviceKey: calls POST /platform/tenants/:id/rotate-keys to rotate kiosk or display key', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            device_type: 'kiosk',
            new_key: 'new-crypto-64char-hex-kiosk-key-rotated',
          },
          error: null,
        }),
      });

      const res = await rotatePlatformDeviceKey('tnt-001', 'kiosk');

      expect(res.success).toBe(true);
      expect(res.data?.device_type).toBe('kiosk');
      expect(res.data?.new_key).toContain('new-crypto-64char');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/tenants/tnt-001/rotate-keys'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ device_type: 'kiosk' }),
        })
      );
    });

    it('deletePlatformTenant: calls DELETE /platform/tenants/:id for soft-deletion', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { message: 'Tenant berhasil dinonaktifkan / dihapus' },
          error: null,
        }),
      });

      const res = await deletePlatformTenant('tnt-001');

      expect(res.success).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/tenants/tnt-001'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('getPlatformTicketAnalytics: calls GET /platform/analytics/tickets and returns summary, daily trend, and top tenants', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            summary: {
              total_tickets_all_time: 1500,
              total_tickets_today: 120,
              total_tickets_yesterday: 100,
              diff_percentage: 20.0,
              avg_serving_time_mins: 4.5,
            },
            daily_trend: [
              { date: '2026-09-15', total_tickets: 100, completed_tickets: 95 },
              { date: '2026-09-16', total_tickets: 120, completed_tickets: 110 },
            ],
            top_tenants_today: [
              {
                rank: 1,
                tenant_id: 'tnt-001',
                name: 'Klinik Medika',
                slug: 'klinik-medika',
                status: 'active',
                total_tickets: 80,
                percentage: 66.6,
              },
            ],
            top_tenants_yesterday: [
              {
                rank: 1,
                tenant_id: 'tnt-001',
                name: 'Klinik Medika',
                slug: 'klinik-medika',
                status: 'active',
                total_tickets: 70,
                percentage: 70.0,
              },
            ],
          },
          error: null,
        }),
      });

      const res = await getPlatformTicketAnalytics(14);

      expect(res.success).toBe(true);
      expect(res.data?.summary.total_tickets_today).toBe(120);
      expect(res.data?.daily_trend).toHaveLength(2);
      expect(res.data?.top_tenants_today[0].rank).toBe(1);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/platform/analytics/tickets?days=14'),
        expect.anything()
      );
    });
  });

  describe('PlatformLayout.astro Component', () => {
    it('renders platform layout with navigation menu, superadmin badge, and logout trigger', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformLayout, {
        props: { title: 'Platform Dashboard - AntriAja Super-Admin' },
      });

      expect(result).toContain('Platform Dashboard - AntriAja Super-Admin');
      expect(result).toContain('id="platform-sidebar"');
      expect(result).toContain('href="/platform"');
      expect(result).toContain('href="/platform/tenants"');
      expect(result).toContain('id="badge-superadmin"');
      expect(result).toContain('id="btn-platform-logout"');
    });

    it('renders categorized navigation groups, quick action links, and landing redirect', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformLayout, {
        props: {
          title: 'Platform Dashboard - AntriAja Super-Admin',
          activePage: 'dashboard',
        },
      });

      // Group headers
      expect(result).toContain('Supervisi Platform');
      expect(result).toContain('Aksi Platform');
      expect(result).toContain('Navigasi AntriAja');

      // Platform navigation links
      expect(result).toContain('href="/platform/analytics"');
      expect(result).toContain('Statistik &amp; Beban Server');

      // Quick action to create tenant
      expect(result).toContain('href="/platform/tenants?action=create"');
      expect(result).toContain('Tambah Tenant');

      // Link to landing page
      expect(result).toContain('href="/"');
      expect(result).toContain('Portal Utama');
    });

    it('renders prominent logout section and confirmation modal with cancel & confirm buttons', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformLayout, {
        props: { title: 'Platform Dashboard - AntriAja Super-Admin' },
      });

      // Prominent logout button label
      expect(result).toContain('Keluar Sesi Platform');

      // Logout modal and its control buttons
      expect(result).toContain('id="modal-platform-logout"');
      expect(result).toContain('id="btn-cancel-platform-logout"');
      expect(result).toContain('id="btn-confirm-platform-logout"');
      expect(result).toContain('Konfirmasi Keluar');
    });

    it('renders responsive off-canvas drawer controls and backdrop overlay', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformLayout, {
        props: { title: 'Platform Dashboard - AntriAja Super-Admin' },
      });

      expect(result).toContain('id="platform-sidebar-backdrop"');
      expect(result).toContain('id="btn-toggle-platform-mobile"');
      expect(result).toContain('id="btn-close-platform-sidebar"');
    });
  });

  describe('src/pages/platform/login.astro Page', () => {
    it('renders platform super-admin login page with email, password inputs, submit button and error container', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformLoginPage);

      expect(result).toContain('Super-Admin Console');
      expect(result).toContain('id="form-platform-login"');
      expect(result).toContain('id="input-platform-email"');
      expect(result).toContain('id="input-platform-password"');
      expect(result).toContain('id="btn-platform-login"');
      expect(result).toContain('id="alert-platform-error"');
    });
  });

  describe('src/pages/platform/index.astro Dashboard Page', () => {
    it('renders global metric cards, quick navigation, and platform activity overview', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformDashboardPage);

      expect(result).toContain('Ringkasan Platform');
      expect(result).toContain('id="stat-total-tenants"');
      expect(result).toContain('id="stat-active-tenants"');
      expect(result).toContain('id="stat-suspended-tenants"');
      expect(result).toContain('id="stat-tickets-today"');
      expect(result).toContain('id="btn-quick-manage-tenants"');
      expect(result).toContain('id="btn-quick-add-tenant"');
    });
  });

  describe('src/pages/platform/tenants.astro Supervision Page', () => {
    it('renders tenant management interface with search, filter, table, and action modals', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformTenantsPage);

      expect(result).toContain('Manajemen Tenant');
      expect(result).toContain('id="input-tenant-search"');
      expect(result).toContain('id="select-status-filter"');
      expect(result).toContain('id="btn-add-tenant"');
      expect(result).toContain('id="table-tenants-container"');
      expect(result).toContain('id="pagination-controls"');

      // Action Modals
      expect(result).toContain('id="modal-create-tenant"');
      expect(result).toContain('id="modal-status-confirm"');
      expect(result).toContain('id="modal-rotate-key"');
    });
  });

  describe('src/pages/platform/analytics.astro Page', () => {
    it('renders ticket statistics, daily barchart container, and top 10 tenants tables', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(PlatformAnalyticsPage);

      expect(result).toContain('Statistik &amp; Beban Server');
      expect(result).toContain('id="stat-total-tickets-all-time"');
      expect(result).toContain('id="stat-total-tickets-today"');
      expect(result).toContain('id="stat-total-tickets-yesterday"');
      expect(result).toContain('id="stat-avg-serving-time"');

      // Daily Barchart
      expect(result).toContain('id="chart-daily-tickets"');

      // Top 10 Tenants
      expect(result).toContain('id="tab-top-tenants-today"');
      expect(result).toContain('id="tab-top-tenants-yesterday"');
      expect(result).toContain('id="table-top-tenants"');
    });
  });
});
