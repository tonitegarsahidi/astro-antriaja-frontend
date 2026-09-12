// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../src/services/serviceService';
import type {
  ServiceResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '../src/types/master.types';

describe('serviceService client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockService: ServiceResponse = {
    id: 'srv-1',
    tenant_id: 'tnt-456',
    name: 'Teller / Setoran Tunai',
    prefix: 'A',
    estimated_duration_mins: 5,
    is_active: true,
    created_at: '2026-09-12T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
  };

  it('lists all tenant services successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [mockService],
        error: null,
      }),
    });

    const res = await listServices();

    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('gets service detail by id successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockService,
        error: null,
      }),
    });

    const res = await getService('srv-1');

    expect(res.success).toBe(true);
    expect(res.data?.prefix).toBe('A');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services/srv-1'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('creates new service successfully', async () => {
    const newServiceReq: CreateServiceRequest = {
      name: 'Customer Service',
      prefix: 'B',
      estimated_duration_mins: 10,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: {
          ...mockService,
          id: 'srv-2',
          name: newServiceReq.name,
          prefix: newServiceReq.prefix,
          estimated_duration_mins: newServiceReq.estimated_duration_mins,
        },
        error: null,
      }),
    });

    const res = await createService(newServiceReq);

    expect(res.success).toBe(true);
    expect(res.data?.prefix).toBe('B');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newServiceReq),
      })
    );
  });

  it('handles PREFIX_ALREADY_EXISTS (HTTP 409) when prefix is duplicate', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'PREFIX_ALREADY_EXISTS',
          message: 'Prefix layanan sudah digunakan',
        },
      }),
    });

    const res = await createService({
      name: 'Layanan Duplikat',
      prefix: 'A',
      estimated_duration_mins: 5,
    });

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('PREFIX_ALREADY_EXISTS');
  });

  it('updates existing service successfully', async () => {
    const updateReq: UpdateServiceRequest = {
      name: 'Teller Prioritas',
      prefix: 'A',
      estimated_duration_mins: 8,
      is_active: true,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          ...mockService,
          name: updateReq.name,
          estimated_duration_mins: updateReq.estimated_duration_mins,
        },
        error: null,
      }),
    });

    const res = await updateService('srv-1', updateReq);

    expect(res.success).toBe(true);
    expect(res.data?.name).toBe('Teller Prioritas');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services/srv-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateReq),
      })
    );
  });

  it('deactivates service successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { message: 'Layanan berhasil dinonaktifkan' },
        error: null,
      }),
    });

    const res = await deleteService('srv-1');

    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services/srv-1'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('handles SERVICE_STILL_HAS_ACTIVE_TICKETS (HTTP 409) on service deactivation', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'SERVICE_STILL_HAS_ACTIVE_TICKETS',
          message: 'Layanan masih memiliki tiket antrian aktif pada hari ini',
        },
      }),
    });

    const res = await deleteService('srv-1');

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('SERVICE_STILL_HAS_ACTIVE_TICKETS');
  });
});
