// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { httpClient } from '../src/lib/httpClient';
import * as storage from '../src/lib/storage';

describe('httpClient utility', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('performs successful GET request and unwraps ApiResponse', async () => {
    const mockData = [{ id: '1', name: 'Teller' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockData,
        error: null,
      }),
    });

    const response = await httpClient.get<typeof mockData>('/services');

    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockData);
    expect(response.error).toBeNull();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/services'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('automatically injects Authorization Bearer header when token exists in storage', async () => {
    vi.spyOn(storage, 'getToken').mockReturnValue('valid-jwt-token');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { status: 'ok' }, error: null }),
    });

    await httpClient.get('/auth/me');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-jwt-token',
        }),
      })
    );
  });

  it('attaches X-Device-Key header when provided in request options', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [], error: null }),
    });

    await httpClient.get('/kiosk/demo/services', {
      deviceKey: 'kiosk-secret-key',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Device-Key': 'kiosk-secret-key',
        }),
      })
    );
  });

  it('handles 409 Conflict domain error by parsing standard backend error envelope', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'COUNTER_STILL_BUSY',
          message: 'Loket masih memiliki tiket aktif',
        },
      }),
    });

    const response = await httpClient.post('/counters/123/release');

    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
    expect(response.error).toEqual({
      code: 'COUNTER_STILL_BUSY',
      message: 'Loket masih memiliki tiket aktif',
    });
  });

  it('handles network failure (fetch throws error) with structured NETWORK_ERROR response', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const response = await httpClient.get('/health');

    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
    expect(response.error?.code).toBe('NETWORK_ERROR');
    expect(response.error?.message).toContain('Koneksi ke server gagal');
  });

  it('supports PUT and DELETE requests with appropriate HTTP methods', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: null, error: null }),
    });

    await httpClient.put('/services/1', { name: 'Updated' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ name: 'Updated' }) })
    );

    await httpClient.delete('/services/1');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  describe('401 Unauthorized & auto-logout handling', () => {
    it('triggers auto-logout and redirects to /admin/login when 401 occurs in admin context', async () => {
      storage.setToken('expired-admin-token');
      storage.setUser({
        id: '1',
        email: 'admin@antriaja.com',
        full_name: 'Admin',
        role: 'admin',
        is_active: true,
        tenant_id: 't1',
        created_at: new Date().toISOString(),
      });
      window.history.pushState({}, '', '/admin/services');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token tidak valid atau telah kedaluwarsa',
          },
        }),
      });

      const response = await httpClient.get('/services');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('UNAUTHORIZED');
      expect(storage.getToken()).toBeNull();
      expect(storage.getUser()).toBeNull();
      expect(window.location.pathname).toBe('/admin/login');
    });

    it('triggers auto-logout and redirects to /staff/login when 401 occurs in staff context', async () => {
      storage.setToken('expired-staff-token');
      storage.setUser({
        id: '2',
        email: 'staff@antriaja.com',
        full_name: 'Staff',
        role: 'staff',
        is_active: true,
        tenant_id: 't1',
        created_at: new Date().toISOString(),
      });
      window.history.pushState({}, '', '/staff');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token tidak valid atau telah kedaluwarsa',
          },
        }),
      });

      await httpClient.get('/queue/state/c1');

      expect(storage.getToken()).toBeNull();
      expect(storage.getUser()).toBeNull();
      expect(window.location.pathname).toBe('/staff/login');
    });

    it('does not redirect if user is already on a login page', async () => {
      window.history.pushState({}, '', '/admin/login');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email atau password salah',
          },
        }),
      });

      await httpClient.post('/auth/login', { email: 'a@a.com', password: 'bad' });

      expect(window.location.pathname).toBe('/admin/login');
    });

    it('does not redirect when skipAuthRedirect is true', async () => {
      storage.setToken('some-token');
      window.history.pushState({}, '', '/admin/counters');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          data: null,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token tidak valid atau telah kedaluwarsa',
          },
        }),
      });

      await httpClient.get('/counters', { skipAuthRedirect: true });

      expect(window.location.pathname).toBe('/admin/counters');
    });
  });
});
