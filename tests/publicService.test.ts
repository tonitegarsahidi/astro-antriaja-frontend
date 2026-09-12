// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPublicTicketByToken } from '../src/services/publicService';
import type { PublicTicketResponse } from '../src/types/queue.types';

describe('publicService client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockTicket: PublicTicketResponse = {
    id: 'ticket-uuid-123',
    tenant_id: 'tenant-uuid-456',
    service_id: 'service-uuid-789',
    ticket_number: 'A-005',
    sequence_number: 5,
    service_date: '2026-09-12',
    status: 'waiting',
    is_vip: false,
    token: 'public-token-abc',
    created_at: '2026-09-12T08:00:00Z',
    service_name: 'Teller / Setoran Tunai',
    service_prefix: 'A',
    estimated_duration_mins: 5,
    queue_ahead_count: 2,
    estimated_wait_mins: 10,
  };

  it('fetches public ticket by token successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockTicket,
        error: null,
      }),
    });

    const response = await getPublicTicketByToken('public-token-abc');

    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockTicket);
    expect(response.error).toBeNull();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/public/tickets/public-token-abc'),
      expect.anything()
    );
  });

  it('encodes URI component for token properly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockTicket,
        error: null,
      }),
    });

    await getPublicTicketByToken('token with special/chars');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/public/tickets/token%20with%20special%2Fchars'),
      expect.anything()
    );
  });

  it('handles 404 ticket not found error gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Nomor tiket tidak ditemukan atau telah kadaluwarsa',
        },
      }),
    });

    const response = await getPublicTicketByToken('non-existent-token');

    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
    expect(response.error?.code).toBe('TICKET_NOT_FOUND');
  });

  it('handles network failure with structured error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const response = await getPublicTicketByToken('any-token');

    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
    expect(response.error?.code).toBe('NETWORK_ERROR');
  });
});
