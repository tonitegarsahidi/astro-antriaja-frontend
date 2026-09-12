import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type {
  ServiceResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '../types/master.types';

/**
 * Mengambil daftar seluruh kategori layanan pada instansi/cabang.
 */
export async function listServices(): Promise<ApiResponse<ServiceResponse[]>> {
  return httpClient.get<ServiceResponse[]>('/services');
}

/**
 * Mengambil detail satu kategori layanan berdasarkan ID.
 */
export async function getService(id: string): Promise<ApiResponse<ServiceResponse>> {
  return httpClient.get<ServiceResponse>(`/services/${id}`);
}

/**
 * Membuat kategori layanan baru.
 */
export async function createService(
  req: CreateServiceRequest
): Promise<ApiResponse<ServiceResponse>> {
  return httpClient.post<ServiceResponse>('/services', req);
}

/**
 * Memperbarui nama, prefix, estimasi durasi, atau status aktif kategori layanan.
 */
export async function updateService(
  id: string,
  req: UpdateServiceRequest
): Promise<ApiResponse<ServiceResponse>> {
  return httpClient.put<ServiceResponse>(`/services/${id}`, req);
}

/**
 * Menonaktifkan atau menghapus kategori layanan.
 */
export async function deleteService(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(`/services/${id}`);
}
