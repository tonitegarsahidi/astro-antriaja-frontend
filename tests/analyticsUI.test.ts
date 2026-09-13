import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AdminLayout from '../src/layouts/AdminLayout.astro';
import AdminAnalyticsPage from '../src/pages/admin/analytics.astro';
import {
  getAnalyticsSummary,
  getPeakHours,
  getServiceMetrics,
  getStaffPerformance,
  exportAnalyticsCSV,
} from '../src/services/analyticsService';
import type {
  AnalyticsSummaryResponse,
  PeakHourItem,
  ServiceAnalyticsItem,
  StaffAnalyticsItem,
} from '../src/types/analytics.types';

describe('Modul D2: Analytics Dashboard UI', () => {
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

  describe('analyticsService API Client', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('getAnalyticsSummary: calls GET /analytics/summary with date range and admin token', async () => {
      const mockSummary: AnalyticsSummaryResponse = {
        total_tickets: 150,
        completed_tickets: 135,
        expired_tickets: 10,
        hold_tickets: 5,
        waiting_tickets: 0,
        avg_wait_seconds: 420.5,
        avg_serve_seconds: 510.2,
        completion_rate: 90.0,
        daily_trend: [
          {
            date: '2026-09-13',
            total_tickets: 150,
            completed_tickets: 135,
            avg_wait_seconds: 420.5,
            avg_serve_seconds: 510.2,
          },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockSummary,
          error: null,
        }),
      });

      const res = await getAnalyticsSummary('2026-09-07', '2026-09-13');

      expect(res.success).toBe(true);
      expect(res.data?.total_tickets).toBe(150);
      expect(res.data?.completion_rate).toBe(90.0);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/analytics\/summary\?.*start_date=2026-09-07.*end_date=2026-09-13/),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-admin-jwt-token',
          }),
        })
      );
    });

    it('getPeakHours: calls GET /analytics/peak-hours and returns 24 hour distribution', async () => {
      const mockHours: PeakHourItem[] = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        ticket_count: i === 9 ? 25 : i === 10 ? 30 : 5,
      }));

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockHours,
          error: null,
        }),
      });

      const res = await getPeakHours('2026-09-13');

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(24);
      expect(res.data?.[10].ticket_count).toBe(30);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/analytics\/peak-hours\?.*date=2026-09-13/),
        expect.anything()
      );
    });

    it('getServiceMetrics: calls GET /analytics/services and returns breakdown per category', async () => {
      const mockServices: ServiceAnalyticsItem[] = [
        {
          service_id: 'srv-1',
          service_name: 'Teller Tunai',
          service_prefix: 'A',
          total_tickets: 100,
          completed_tickets: 95,
          expired_tickets: 5,
          avg_wait_seconds: 300,
          avg_serve_seconds: 400,
          completion_rate: 95.0,
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockServices,
          error: null,
        }),
      });

      const res = await getServiceMetrics('2026-09-07', '2026-09-13');

      expect(res.success).toBe(true);
      expect(res.data?.[0].service_prefix).toBe('A');
      expect(res.data?.[0].completion_rate).toBe(95.0);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/analytics\/services\?.*start_date=2026-09-07.*end_date=2026-09-13/),
        expect.anything()
      );
    });

    it('getStaffPerformance: calls GET /analytics/staff and returns throughput metrics', async () => {
      const mockStaff: StaffAnalyticsItem[] = [
        {
          user_id: 'usr-1',
          full_name: 'Budi Santoso',
          email: 'budi@bank.com',
          total_served: 45,
          avg_serve_seconds: 380.0,
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockStaff,
          error: null,
        }),
      });

      const res = await getStaffPerformance('2026-09-07', '2026-09-13');

      expect(res.success).toBe(true);
      expect(res.data?.[0].full_name).toBe('Budi Santoso');
      expect(res.data?.[0].total_served).toBe(45);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/analytics\/staff\?.*start_date=2026-09-07.*end_date=2026-09-13/),
        expect.anything()
      );
    });

    it('exportAnalyticsCSV: calls GET /analytics/export/csv and returns text blob', async () => {
      const mockCsvContent = 'Nomor Tiket,Layanan,Loket,Petugas Staf,Status\nA-001,Teller,Loket 1,Budi,completed';

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => mockCsvContent,
        headers: new Headers({
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="laporan.csv"',
        }),
      });

      const csvData = await exportAnalyticsCSV('2026-09-07', '2026-09-13');

      expect(csvData).toContain('Nomor Tiket');
      expect(csvData).toContain('A-001');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/analytics\/export\/csv\?.*start_date=2026-09-07.*end_date=2026-09-13/),
        expect.anything()
      );
    });
  });

  describe('AdminLayout.astro Navigation', () => {
    it('renders navigation link pointing to /admin/analytics', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminLayout, {
        props: { activePage: 'analytics', title: 'Analitik & Laporan Antrian' },
      });

      expect(result).toContain('href="/admin/analytics"');
      expect(result).toContain('Analitik');
    });
  });

  describe('src/pages/admin/analytics.astro Page', () => {
    it('renders analytics dashboard with filters, stat cards, charts, and data tables', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(AdminAnalyticsPage);

      // Title & Header
      expect(result).toContain('Laporan & Analitik Antrian');
      expect(result).toContain('id="btn-export-csv"');

      // Date Filters
      expect(result).toContain('id="btn-preset-today"');
      expect(result).toContain('id="btn-preset-7days"');
      expect(result).toContain('id="btn-preset-30days"');
      expect(result).toContain('id="input-start-date"');
      expect(result).toContain('id="input-end-date"');
      expect(result).toContain('id="btn-apply-date-filter"');

      // Metric Cards
      expect(result).toContain('id="stat-total-tickets"');
      expect(result).toContain('id="stat-completed-tickets"');
      expect(result).toContain('id="stat-expired-tickets"');
      expect(result).toContain('id="stat-avg-wait-time"');
      expect(result).toContain('id="stat-avg-serve-time"');
      expect(result).toContain('id="stat-completion-rate"');

      // Visualizations & Tables
      expect(result).toContain('id="chart-peak-hours"');
      expect(result).toContain('id="table-services-metrics"');
      expect(result).toContain('id="table-staff-metrics"');
    });
  });
});
