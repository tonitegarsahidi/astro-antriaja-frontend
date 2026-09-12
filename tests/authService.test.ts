// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { login, getMe } from '../src/services/authService';
import type { LoginRequest, LoginResponse, MeResponse } from '../src/types/auth.types';

describe('authService client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockLoginRequest: LoginRequest = {
    tenant_slug: 'demo-bank',
    email: 'teller1@antriaja.com',
    password: 'password123',
  };

  const mockLoginResponse: LoginResponse = {
    token: 'jwt-mock-token-xyz',
    user: {
      id: 'usr-123',
      tenant_id: 'tnt-456',
      email: 'teller1@antriaja.com',
      full_name: 'Budi Teller',
      role: 'staff',
      created_at: '2026-09-12T08:00:00Z',
    },
    tenant: {
      id: 'tnt-456',
      name: 'Bank Demo Cabang Utama',
      slug: 'demo-bank',
      kiosk_key: 'kiosk-key-123',
      display_key: 'display-key-123',
      transfer_ticket_mode: 'new_number_priority',
      daily_reset_time: '00:00:00',
      created_at: '2026-09-12T08:00:00Z',
    },
  };

  it('performs staff login successfully and returns credentials', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockLoginResponse,
        error: null,
      }),
    });

    const res = await login(mockLoginRequest);

    expect(res.success).toBe(true);
    expect(res.data).toEqual(mockLoginResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockLoginRequest),
      })
    );
  });

  it('handles invalid credentials (HTTP 401) error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email atau kata sandi tidak sesuai',
        },
      }),
    });

    const res = await login({
      ...mockLoginRequest,
      password: 'wrongpassword',
    });

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('handles brute-force rate limit (HTTP 429) error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 1 menit',
        },
      }),
    });

    const res = await login(mockLoginRequest);

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('TOO_MANY_REQUESTS');
  });

  it('fetches current logged in staff profile via getMe', async () => {
    const mockMe: MeResponse = {
      user: mockLoginResponse.user,
      tenant: mockLoginResponse.tenant,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockMe,
        error: null,
      }),
    });

    const res = await getMe();

    expect(res.success).toBe(true);
    expect(res.data?.user.email).toBe('teller1@antriaja.com');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });
});
