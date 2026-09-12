// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createCounter,
  updateCounter,
  assignServices,
} from '../src/services/counterService';
import type {
  CounterResponse,
  CreateCounterRequest,
  UpdateCounterRequest,
} from '../src/types/master.types';

describe('counterService admin operations', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockCounter: CounterResponse = {
    id: 'ctr-1',
    tenant_id: 'tnt-456',
    counter_number: 1,
    name: 'Loket 1 - Teller',
    status: 'idle',
    current_staff_id: null,
    services: [],
    created_at: '2026-09-12T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
  };

  it('creates new counter with assigned service IDs successfully', async () => {
    const createReq: CreateCounterRequest = {
      counter_number: 3,
      name: 'Loket 3 - Setoran Cepat',
      service_ids: ['srv-1'],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: {
          ...mockCounter,
          id: 'ctr-3',
          counter_number: 3,
          name: createReq.name,
        },
        error: null,
      }),
    });

    const res = await createCounter(createReq);

    expect(res.success).toBe(true);
    expect(res.data?.counter_number).toBe(3);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/counters'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(createReq),
      })
    );
  });

  it('handles COUNTER_NUMBER_ALREADY_EXISTS (HTTP 409) when counter number is duplicate', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'COUNTER_NUMBER_ALREADY_EXISTS',
          message: 'Nomor loket tersebut sudah digunakan',
        },
      }),
    });

    const res = await createCounter({
      counter_number: 1,
      name: 'Loket 1 Duplikat',
      service_ids: [],
    });

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('COUNTER_NUMBER_ALREADY_EXISTS');
  });

  it('updates counter details successfully', async () => {
    const updateReq: UpdateCounterRequest = {
      counter_number: 1,
      name: 'Loket 1 - Teller & CS',
      status: 'idle',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          ...mockCounter,
          name: updateReq.name,
        },
        error: null,
      }),
    });

    const res = await updateCounter('ctr-1', updateReq);

    expect(res.success).toBe(true);
    expect(res.data?.name).toBe('Loket 1 - Teller & CS');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/counters/ctr-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateReq),
      })
    );
  });

  it('assigns M:N services to counter successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: null,
        error: null,
      }),
    });

    const res = await assignServices('ctr-1', ['srv-1', 'srv-2']);

    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/counters/ctr-1/services'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ service_ids: ['srv-1', 'srv-2'] }),
      })
    );
  });
});
