import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AdminLayout from '../src/layouts/AdminLayout.astro';
import AdminBillingPage from '../src/pages/admin/billing.astro';
import {
  getPlans,
  getCurrentSubscription,
  upgradePlan,
  getInvoices,
} from '../src/services/subscriptionService';
import type {
  PlanResponse,
  SubscriptionDetailResponse,
  InvoiceResponse,
} from '../src/types/subscription.types';

describe('Modul E2: Billing & Subscription UI', () => {
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
    mockLocalStorage.setItem('antriaja_token', 'mock-admin-jwt-token');
  });

  describe('subscriptionService API Client', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('getPlans: calls GET /plans and returns array of plans', async () => {
      const mockPlans: PlanResponse[] = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          code: 'free',
          name: 'Free Starter',
          description: 'Paket gratis selamanya',
          price_monthly: 0,
          max_counters: 2,
          max_services: 3,
          max_staff: 3,
          max_daily_tickets: 100,
          features: ['Cetak tiket fisik & QR', 'Layar display TV'],
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          code: 'pro',
          name: 'Professional',
          description: 'Untuk bisnis menengah berkembang',
          price_monthly: 299000,
          max_counters: 10,
          max_services: 15,
          max_staff: 15,
          max_daily_tickets: 2000,
          features: ['Semua fitur Starter', 'Multi-loket prioritas'],
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockPlans, error: null }),
      });

      const res = await getPlans();

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(2);
      expect(res.data?.[0].code).toBe('free');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/plans$/),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-admin-jwt-token',
          }),
        })
      );
    });

    it('getCurrentSubscription: calls GET /subscriptions/current with usage stats', async () => {
      const mockSub: SubscriptionDetailResponse = {
        id: 'sub-12345',
        tenant_id: 'tenant-12345',
        status: 'active',
        current_period_start: '2026-09-01T00:00:00Z',
        current_period_end: null,
        plan: {
          id: '11111111-1111-1111-1111-111111111111',
          code: 'free',
          name: 'Free Starter',
          description: 'Paket gratis selamanya',
          price_monthly: 0,
          max_counters: 2,
          max_services: 3,
          max_staff: 3,
          max_daily_tickets: 100,
          features: ['Cetak tiket fisik & QR'],
        },
        usage: {
          counters_count: 1,
          max_counters: 2,
          services_count: 2,
          max_services: 3,
          staff_count: 2,
          max_staff: 3,
          today_tickets: 45,
          max_daily_tickets: 100,
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockSub, error: null }),
      });

      const res = await getCurrentSubscription();

      expect(res.success).toBe(true);
      expect(res.data?.status).toBe('active');
      expect(res.data?.plan.code).toBe('free');
      expect(res.data?.usage.counters_count).toBe(1);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscriptions\/current$/),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-admin-jwt-token',
          }),
        })
      );
    });

    it('upgradePlan: calls POST /subscriptions/upgrade with plan_code and returns updated subscription', async () => {
      const mockUpdatedSub: SubscriptionDetailResponse = {
        id: 'sub-12345',
        tenant_id: 'tenant-12345',
        status: 'active',
        current_period_start: '2026-09-13T00:00:00Z',
        current_period_end: '2026-10-13T00:00:00Z',
        plan: {
          id: '33333333-3333-3333-3333-333333333333',
          code: 'pro',
          name: 'Professional',
          description: 'Untuk bisnis berkembang pesat',
          price_monthly: 299000,
          max_counters: 10,
          max_services: 15,
          max_staff: 15,
          max_daily_tickets: 2000,
          features: ['Prioritas tinggi'],
        },
        usage: {
          counters_count: 1,
          max_counters: 10,
          services_count: 2,
          max_services: 15,
          staff_count: 2,
          max_staff: 15,
          today_tickets: 45,
          max_daily_tickets: 2000,
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockUpdatedSub, error: null }),
      });

      const res = await upgradePlan({ plan_code: 'pro' });

      expect(res.success).toBe(true);
      expect(res.data?.plan.code).toBe('pro');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscriptions\/upgrade$/),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ plan_code: 'pro' }),
        })
      );
    });

    it('getInvoices: calls GET /subscriptions/invoices and returns invoice history', async () => {
      const mockInvoices: InvoiceResponse[] = [
        {
          id: 'inv-1',
          tenant_id: 'tenant-12345',
          invoice_number: 'INV-202609-0001',
          amount: 299000,
          status: 'paid',
          paid_at: '2026-09-13T10:00:00Z',
          due_date: '2026-09-20T10:00:00Z',
          created_at: '2026-09-13T10:00:00Z',
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockInvoices, error: null }),
      });

      const res = await getInvoices();

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.data?.[0].invoice_number).toBe('INV-202609-0001');
      expect(res.data?.[0].status).toBe('paid');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/subscriptions\/invoices$/),
        expect.anything()
      );
    });
  });

  describe('AdminLayout.astro Navigation', () => {
    it('renders navigation link pointing to /admin/billing', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminLayout, {
        props: { activePage: 'billing', title: 'Paket & Langganan' },
      });

      expect(result).toContain('href="/admin/billing"');
      expect(result).toContain('Paket &amp; Langganan');
    });
  });

  describe('src/pages/admin/billing.astro Page', () => {
    it('renders billing dashboard with quota meters, plan comparison, upgrade modal, and invoice table', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminBillingPage);

      // Header & Active Plan Card
      expect(result).toContain('Paket & Manajemen Langganan');
      expect(result).toContain('id="current-plan-name"');
      expect(result).toContain('id="current-plan-status"');
      expect(result).toContain('id="current-plan-price"');

      // Quota Usage Progress Meters
      expect(result).toContain('id="meter-counters"');
      expect(result).toContain('id="meter-services"');
      expect(result).toContain('id="meter-staff"');
      expect(result).toContain('id="meter-daily-tickets"');

      // Plan Comparison Section
      expect(result).toContain('id="plan-cards-container"');

      // Upgrade Confirmation Modal
      expect(result).toContain('id="modal-upgrade-plan"');
      expect(result).toContain('id="btn-confirm-upgrade"');
      expect(result).toContain('id="btn-cancel-upgrade"');

      // Invoices History Table
      expect(result).toContain('id="table-invoices-body"');
      expect(result).toContain('Riwayat Tagihan & Invoice');
    });
  });
});
