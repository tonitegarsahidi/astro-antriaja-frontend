// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  listCounters,
  occupyCounter,
  releaseCounter,
} from '../src/services/counterService';
import type { CounterResponse } from '../src/types/master.types';

describe('counterService client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockCounters: CounterResponse[] = [
    {
      id: 'ctr-1',
      tenant_id: 'tnt-456',
      counter_number: 1,
      name: 'Loket 1 - Teller',
      status: 'idle',
      current_staff_id: null,
      services: [
        {
          id: 'srv-1',
          tenant_id: 'tnt-456',
          name: 'Teller / Setoran Tunai',
          prefix: 'A',
          estimated_duration_mins: 5,
          is_active: true,
          created_at: '2026-09-12T08:00:00Z',
          updated_at: '2026-09-12T08:00:00Z',
        },
      ],
      created_at: '2026-09-12T08:00:00Z',
      updated_at: '2026-09-12T08:00:00Z',
    },
    {
      id: 'ctr-2',
      tenant_id: 'tnt-456',
      counter_number: 2,
      name: 'Loket 2 - Customer Service',
      status: 'serving',
      current_staff_id: 'usr-999',
      services: [],
      created_at: '2026-09-12T08:00:00Z',
      updated_at: '2026-09-12T08:00:00Z',
    },
  ];

  it('lists all branch counters successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockCounters,
        error: null,
      }),
    });

    const res = await listCounters();

    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/counters'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('occupies counter successfully', async () => {
    const occupiedCounter = {
      ...mockCounters[0],
      current_staff_id: 'usr-123',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: occupiedCounter,
        error: null,
      }),
    });

    const res = await occupyCounter('ctr-1');

    expect(res.success).toBe(true);
    expect(res.data?.current_staff_id).toBe('usr-123');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/counters/ctr-1/occupy'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('handles COUNTER_ALREADY_OCCUPIED (HTTP 409) when occupied by another staff', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'COUNTER_ALREADY_OCCUPIED',
          message: 'Loket ini sedang dijaga oleh staf lain',
        },
      }),
    });

    const res = await occupyCounter('ctr-2');

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('COUNTER_ALREADY_OCCUPIED');
  });

  it('handles STAFF_HAS_ACTIVE_TICKET (HTTP 409) when staff leaves busy counter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'STAFF_HAS_ACTIVE_TICKET',
          message: 'Anda masih memiliki tiket yang sedang aktif dilayani di loket lain',
        },
      }),
    });

    const res = await occupyCounter('ctr-1');

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('STAFF_HAS_ACTIVE_TICKET');
  });

  it('releases counter successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: null,
        error: null,
      }),
    });

    const res = await releaseCounter('ctr-1');

    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/counters/ctr-1/release'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('handles COUNTER_STILL_BUSY (HTTP 409) when releasing counter with active tickets', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'COUNTER_STILL_BUSY',
          message: 'Loket masih melayani tiket aktif. Selesaikan atau tunda tiket terlebih dahulu.',
        },
      }),
    });

    const res = await releaseCounter('ctr-1');

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('COUNTER_STILL_BUSY');
  });
});
