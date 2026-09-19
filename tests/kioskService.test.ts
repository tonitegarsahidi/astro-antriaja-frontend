// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getKioskServices,
  issueKioskTicket,
  verifyVIPPIN,
  getKioskInfo,
} from '../src/services/kioskService';
import type {
  KioskServiceSummaryResponse,
  TicketResponse,
} from '../src/types/queue.types';

describe('kioskService client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockServices: KioskServiceSummaryResponse[] = [
    {
      id: 'srv-1',
      name: 'Teller / Setoran Tunai',
      prefix: 'A',
      estimated_duration_mins: 5,
      waiting_count: 3,
    },
    {
      id: 'srv-2',
      name: 'Customer Service',
      prefix: 'B',
      estimated_duration_mins: 10,
      waiting_count: 1,
    },
  ];

  const mockTicket: TicketResponse = {
    id: 'tkt-123',
    tenant_id: 'tnt-456',
    service_id: 'srv-1',
    ticket_number: 'A-004',
    sequence_number: 4,
    service_date: '2026-09-12',
    status: 'waiting',
    is_vip: false,
    token: 'token-reg-456',
    created_at: '2026-09-12T09:00:00Z',
  };

  it('fetches kiosk services summary with device key header', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockServices,
        error: null,
      }),
    });

    const res = await getKioskServices('demo-bank', 'kiosk-device-key-123');

    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockServices);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/kiosk/demo-bank/services'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Device-Key': 'kiosk-device-key-123',
        }),
      })
    );
  });

  it('issues regular kiosk ticket successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockTicket,
        error: null,
      }),
    });

    const res = await issueKioskTicket('demo-bank', 'srv-1', 'kiosk-key');

    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockTicket);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/kiosk/demo-bank/tickets'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ service_id: 'srv-1' }),
      })
    );
  });

  it('verifies VIP PIN and issues priority ticket', async () => {
    const vipTicket: TicketResponse = {
      ...mockTicket,
      is_vip: true,
      ticket_number: 'A-005',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: vipTicket,
        error: null,
      }),
    });

    const res = await verifyVIPPIN('demo-bank', 'srv-1', '123456', 'kiosk-key');

    expect(res.success).toBe(true);
    expect(res.data?.is_vip).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/kiosk/demo-bank/verify-pin'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ service_id: 'srv-1', pin: '123456' }),
      })
    );
  });

  it('handles invalid VIP PIN error gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'INVALID_PIN',
          message: 'PIN jalur prioritas tidak valid',
        },
      }),
    });

    const res = await verifyVIPPIN('demo-bank', 'srv-1', '999999', 'kiosk-key');

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('INVALID_PIN');
  });

  it('fetches kiosk tenant info with device key header and returns tenant name and logo url', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          tenant_name: 'Puskesmas Maju Jaya',
          tenant_slug: 'puskesmas-maju-jaya',
          logo_url: '/uploads/images/puskesmas-logo.png',
        },
        error: null,
      }),
    });

    const res = await getKioskInfo('puskesmas-maju-jaya', 'kiosk-key-123');

    expect(res.success).toBe(true);
    expect(res.data?.tenant_name).toBe('Puskesmas Maju Jaya');
    expect(res.data?.tenant_slug).toBe('puskesmas-maju-jaya');
    expect(res.data?.logo_url).toBe('/uploads/images/puskesmas-logo.png');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/kiosk/puskesmas-maju-jaya/info'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Device-Key': 'kiosk-key-123',
        }),
      })
    );
  });
});
