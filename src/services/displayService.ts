/**
 * Service Komunikasi Data Layar Display TV AntriAja
 */
import { httpClient } from '../lib/httpClient';
import type { DisplaySnapshotResponse } from '../types/display.types';

/**
 * Mengambil status awal layar Display TV berdasarkan slug tenant
 */
export async function getDisplaySnapshot(
  tenantSlug: string,
  deviceKey?: string
): Promise<DisplaySnapshotResponse> {
  const safeSlug = (tenantSlug || '').trim();
  if (!safeSlug) {
    throw new Error('Slug tenant tidak boleh kosong');
  }

  const response = await httpClient.get<DisplaySnapshotResponse>(
    `/display/${encodeURIComponent(safeSlug)}`,
    { deviceKey }
  );

  if (!response.success || !response.data) {
    throw new Error(
      response.error?.message || 'Gagal mengambil data snapshot display'
    );
  }

  return response.data;
}

/**
 * Mengambil konfigurasi display TV cabang yang sedang aktif (khusus admin).
 */
export async function getDisplaySettings(): Promise<
  import('../types/api.types').ApiResponse<
    import('../types/display.types').DisplaySettingsResponse
  >
> {
  return httpClient.get<import('../types/display.types').DisplaySettingsResponse>(
    '/display/settings'
  );
}

/**
 * Memperbarui konfigurasi display TV cabang (running text, media, voice).
 */
export async function updateDisplaySettings(
  req: import('../types/display.types').UpdateDisplaySettingsRequest
): Promise<
  import('../types/api.types').ApiResponse<
    import('../types/display.types').DisplaySettingsResponse
  >
> {
  return httpClient.put<import('../types/display.types').DisplaySettingsResponse>(
    '/display/settings',
    req
  );
}

