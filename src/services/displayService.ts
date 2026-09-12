/**
 * Service Komunikasi Data Layar Display TV AntriAja
 */
import { httpClient } from '../lib/httpClient';
import type { DisplaySnapshotResponse } from '../types/display.types';

/**
 * Mengambil status awal layar Display TV berdasarkan slug tenant
 */
export async function getDisplaySnapshot(
  tenantSlug: string
): Promise<DisplaySnapshotResponse> {
  const safeSlug = (tenantSlug || '').trim();
  if (!safeSlug) {
    throw new Error('Slug tenant tidak boleh kosong');
  }

  const response = await httpClient.get<DisplaySnapshotResponse>(
    `/display/${encodeURIComponent(safeSlug)}`
  );

  if (!response.success || !response.data) {
    throw new Error(
      response.error?.message || 'Gagal mengambil data snapshot display'
    );
  }

  return response.data;
}
