import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import RegisterPage from '../src/pages/register.astro';
import OnboardingPage from '../src/pages/onboarding.astro';
import IndexPage from '../src/pages/index.astro';
import { registerTenant } from '../src/services/authService';
import type { RegisterTenantRequest, RegisterTenantResponse } from '../src/types/auth.types';

describe('Modul B2: Self-Service Registration & Onboarding Flow', () => {
  describe('authService.registerTenant API Client', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    const mockRegisterRequest: RegisterTenantRequest = {
      name: 'Klinik Medika Pratama',
      slug: 'klinik-medika',
      admin_email: 'admin@klinikmedika.com',
      admin_password: 'passwordAman123',
      admin_name: 'Dr. Pratama',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10',
      timezone: 'Asia/Jakarta',
    };

    const mockRegisterResponse: RegisterTenantResponse = {
      token: 'jwt-registered-token-xyz',
      admin: {
        id: 'usr-999',
        tenant_id: 'tnt-888',
        email: 'admin@klinikmedika.com',
        full_name: 'Dr. Pratama',
        role: 'admin',
        is_active: true,
        created_at: '2026-09-13T08:00:00Z',
      },
      tenant: {
        id: 'tnt-888',
        name: 'Klinik Medika Pratama',
        slug: 'klinik-medika',
        kiosk_key: 'kiosk-sec-64chars-hex-key-1234567890abcdef1234567890abcdef1234567890',
        display_key: 'display-sec-64chars-hex-key-1234567890abcdef1234567890abcdef12345678',
        transfer_ticket_mode: 'new_number_priority',
        daily_reset_time: '00:00:00',
        status: 'active',
        phone: '081234567890',
        address: 'Jl. Merdeka No. 10',
        timezone: 'Asia/Jakarta',
        created_at: '2026-09-13T08:00:00Z',
      },
    };

    it('successfully calls POST /auth/register-tenant and returns token with credentials', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: mockRegisterResponse,
          error: null,
        }),
      });

      const res = await registerTenant(mockRegisterRequest);

      expect(res.success).toBe(true);
      expect(res.data?.token).toBe('jwt-registered-token-xyz');
      expect(res.data?.tenant.slug).toBe('klinik-medika');
      expect(res.data?.tenant.status).toBe('active');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register-tenant'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockRegisterRequest),
        })
      );
    });

    it('handles duplicate slug conflict (HTTP 409) error correctly', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          data: null,
          error: {
            code: 'SLUG_ALREADY_EXISTS',
            message: 'Slug tenant tersebut sudah digunakan oleh instansi lain',
          },
        }),
      });

      const res = await registerTenant(mockRegisterRequest);

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('SLUG_ALREADY_EXISTS');
      expect(res.error?.message).toContain('sudah digunakan');
    });

    it('handles validation error (HTTP 400)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          data: null,
          error: {
            code: 'INVALID_INPUT',
            message: 'Format email tidak valid',
          },
        }),
      });

      const res = await registerTenant({
        ...mockRegisterRequest,
        admin_email: 'bukan-email',
      });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('INVALID_INPUT');
    });
  });

  describe('src/pages/register.astro', () => {
    it('renders registration page with form fields, slug helper, and submit button', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(RegisterPage);

      expect(result).toContain('Daftar Instansi Baru');
      expect(result).toContain('id="form-register"');
      expect(result).toContain('id="input-tenant-name"');
      expect(result).toContain('id="input-tenant-slug"');
      expect(result).toContain('id="slug-preview"');
      expect(result).toContain('id="input-admin-name"');
      expect(result).toContain('id="input-admin-email"');
      expect(result).toContain('id="input-admin-password"');
      expect(result).toContain('id="input-tenant-phone"');
      expect(result).toContain('id="input-tenant-address"');
      expect(result).toContain('id="select-tenant-timezone"');
      expect(result).toContain('id="btn-register-submit"');
      expect(result).toContain('id="alert-register-error"');
      expect(result).toContain('/admin/login');
    });
  });

  describe('src/pages/onboarding.astro', () => {
    it('renders onboarding setup wizard with credential cards and action buttons', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(OnboardingPage);

      expect(result).toContain('Selamat Datang di AntriAja');
      expect(result).toContain('id="onboarding-container"');
      expect(result).toContain('id="card-kiosk-url"');
      expect(result).toContain('id="card-display-url"');
      expect(result).toContain('id="btn-copy-kiosk-url"');
      expect(result).toContain('id="btn-copy-display-url"');
      expect(result).toContain('id="btn-launch-kiosk"');
      expect(result).toContain('id="btn-launch-display"');
      expect(result).toContain('id="btn-goto-admin"');
    });
  });

  describe('src/pages/index.astro CTA update', () => {
    it('renders landing page with CTA links pointing to /register', async () => {
      const container = await AstroContainer.create();
      const result = await container.renderToString(IndexPage);

      expect(result).toContain('/register');
      expect(result).toContain('Daftar Gratis');
    });
  });
});
