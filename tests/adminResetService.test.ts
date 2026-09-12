// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetQueue } from '../src/services/adminService';
import type { ResetQueueResponse } from '../src/types/queue.types';

describe('adminService emergency reset queue', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockResetResponse: ResetQueueResponse = {
    tenant_id: 'tnt-456',
    expired_tickets_count: 8,
    counters_reset_count: 2,
    reset_at: '2026-09-12T12:00:00Z',
    manual_trigger: true,
    message: 'Siklus antrian berhasil direset',
  };

  it('triggers emergency daily reset successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockResetResponse,
        error: null,
      }),
    });

    const res = await resetQueue();

    expect(res.success).toBe(true);
    expect(res.data?.expired_tickets_count).toBe(8);
    expect(res.data?.counters_reset_count).toBe(2);
    expect(res.data?.manual_trigger).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/queues/reset'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('handles FORBIDDEN (HTTP 403) when non-admin tries to reset queue', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'Hanya administrator cabang yang berhak mereset antrian',
        },
      }),
    });

    const res = await resetQueue();

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('FORBIDDEN');
  });
});
