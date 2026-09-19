// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDisplaySnapshot } from '../src/services/displayService';
import type { DisplaySnapshotResponse } from '../src/types/display.types';

describe('displayService client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockSnapshot: DisplaySnapshotResponse = {
    tenant_name: 'Klinik Sehat Sentosa',
    tenant_slug: 'klinik-sehat',
    tenant_logo_url: '/uploads/images/klinik-logo.png',
    display_settings: {
      tenant_id: 'tnt-123',
      running_text: 'Selamat datang di Klinik Sehat Sentosa',
      media_url: 'https://example.com/promo.mp4',
      media_type: 'video',
      voice_enabled: true,
      bell_sound: 'ding_dong',
      voice_lang: 'id-ID',
      voice_gender: 'female',
      voice_pitch: 1.0,
      voice_rate: 0.9,
      updated_at: '2026-09-12T08:00:00Z',
    },
    active_calls: [
      {
        counter_id: 'ctr-1',
        counter_number: 1,
        counter_name: 'Loket 1 - Pendaftaran',
        ticket_number: 'A-015',
        service_name: 'Pendaftaran Rawat Jalan',
        service_prefix: 'A',
        status: 'called',
        called_at: '2026-09-12T09:15:00Z',
      },
    ],
    recent_calls: [
      {
        ticket_number: 'A-014',
        counter_number: 1,
        counter_name: 'Loket 1',
        service_name: 'Pendaftaran Rawat Jalan',
        service_prefix: 'A',
        called_at: '2026-09-12T09:05:00Z',
      },
      {
        ticket_number: 'B-003',
        counter_number: 2,
        counter_name: 'Loket 2',
        service_name: 'Kasir & Pembayaran',
        service_prefix: 'B',
        called_at: '2026-09-12T09:00:00Z',
      },
    ],
  };

  it('fetches display snapshot successfully for a valid tenant slug', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockSnapshot,
        error: null,
      }),
    });

    const result = await getDisplaySnapshot('klinik-sehat');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/display/klinik-sehat'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );

    expect(result.tenant_name).toBe('Klinik Sehat Sentosa');
    expect(result.tenant_logo_url).toBe('/uploads/images/klinik-logo.png');
    expect(result.active_calls.length).toBe(1);
    expect(result.recent_calls.length).toBe(2);
    expect(result.display_settings.voice_enabled).toBe(true);
  });

  it('throws an error when tenant is not found (404)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant tidak ditemukan',
        },
      }),
    });

    await expect(getDisplaySnapshot('unknown-slug')).rejects.toThrow(
      'Tenant tidak ditemukan'
    );
  });

  it('throws an error when server fails (500)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'GET_SNAPSHOT_FAILED',
          message: 'Gagal mengambil data snapshot display',
        },
      }),
    });

    await expect(getDisplaySnapshot('klinik-sehat')).rejects.toThrow(
      'Gagal mengambil data snapshot display'
    );
  });

  it('handles empty / blank slug parameter safely', async () => {
    await expect(getDisplaySnapshot('')).rejects.toThrow('Slug tenant tidak boleh kosong');
  });
});
