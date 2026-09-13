import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type {
  TenantProfileResponse,
  UpdateTenantProfileRequest,
  RotateDeviceKeyRequest,
  RotateDeviceKeyResponse,
} from '../types/tenant.types';

/**
 * Mengambil informasi profil lengkap instansi / tenant.
 */
export async function getTenantProfile(): Promise<ApiResponse<TenantProfileResponse>> {
  return httpClient.get<TenantProfileResponse>('/tenant/profile');
}

/**
 * Memperbarui profil dan konfigurasi instansi / tenant.
 */
export async function updateTenantProfile(
  req: UpdateTenantProfileRequest
): Promise<ApiResponse<TenantProfileResponse>> {
  return httpClient.put<TenantProfileResponse>('/tenant/profile', req);
}

/**
 * Me-regenerasi kunci perangkat (kiosk / display) secara kriptografis.
 */
export async function rotateDeviceKey(
  req: RotateDeviceKeyRequest
): Promise<ApiResponse<RotateDeviceKeyResponse>> {
  return httpClient.post<RotateDeviceKeyResponse>('/tenant/device-keys/rotate', req);
}
