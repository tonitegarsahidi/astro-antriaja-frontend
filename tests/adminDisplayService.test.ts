// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDisplaySettings,
  updateDisplaySettings,
} from '../src/services/displayService';
import type {
  DisplaySettingsResponse,
  UpdateDisplaySettingsRequest,
} from '../src/types/display.types';

describe('displayService admin operations', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockSettings: DisplaySettingsResponse = {
    tenant_id: 'tnt-456',
    running_text: 'Selamat datang di Bank Demo Cabang Utama',
    media_url: 'https://example.com/promo.mp4',
    media_type: 'video',
    voice_enabled: true,
    bell_sound: 'ding_dong',
    voice_lang: 'id-ID',
    voice_gender: 'female',
    voice_pitch: 1.0,
    voice_rate: 0.9,
    updated_at: '2026-09-12T08:00:00Z',
  };

  it('fetches current tenant display settings successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockSettings,
        error: null,
      }),
    });

    const res = await getDisplaySettings();

    expect(res.success).toBe(true);
    expect(res.data?.running_text).toBe('Selamat datang di Bank Demo Cabang Utama');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/display/settings'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('updates display settings successfully', async () => {
    const updateReq: UpdateDisplaySettingsRequest = {
      running_text: 'Pengumuman: Layanan libur akhir pekan',
      media_type: 'image',
      media_url: 'https://example.com/banner.jpg',
      voice_enabled: true,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          ...mockSettings,
          ...updateReq,
        },
        error: null,
      }),
    });

    const res = await updateDisplaySettings(updateReq);

    expect(res.success).toBe(true);
    expect(res.data?.running_text).toBe('Pengumuman: Layanan libur akhir pekan');
    expect(res.data?.media_type).toBe('image');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/display/settings'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateReq),
      })
    );
  });
});
