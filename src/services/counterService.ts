import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type { CounterResponse } from '../types/master.types';

/**
 * Mengambil daftar seluruh loket fisik instansi beserta layanannya dan status staf yang menjaganya.
 */
export async function listCounters(): Promise<ApiResponse<CounterResponse[]>> {
  return httpClient.get<CounterResponse[]>('/counters');
}

/**
 * Menugaskan staf yang sedang login untuk menjaga/menduduki loket fisik tertentu.
 */
export async function occupyCounter(counterId: string): Promise<ApiResponse<CounterResponse>> {
  return httpClient.post<CounterResponse>(`/counters/${counterId}/occupy`);
}

/**
 * Melepaskan loket fisik yang sedang dijaga oleh staf menjadi berstatus idle.
 */
export async function releaseCounter(counterId: string): Promise<ApiResponse<null>> {
  return httpClient.post<null>(`/counters/${counterId}/release`);
}

/**
 * Membuat loket fisik baru beserta penugasan layanan awal (khusus admin).
 */
export async function createCounter(
  req: import('../types/master.types').CreateCounterRequest
): Promise<ApiResponse<CounterResponse>> {
  return httpClient.post<CounterResponse>('/counters', req);
}

/**
 * Memperbarui data meja loket fisik (khusus admin).
 */
export async function updateCounter(
  counterId: string,
  req: import('../types/master.types').UpdateCounterRequest
): Promise<ApiResponse<CounterResponse>> {
  return httpClient.put<CounterResponse>(`/counters/${counterId}`, req);
}

/**
 * Mengatur pemetaan relasi multi-layanan (M:N) pada loket fisik (khusus admin).
 */
export async function assignServices(
  counterId: string,
  serviceIds: string[]
): Promise<ApiResponse<null>> {
  return httpClient.put<null>(`/counters/${counterId}/services`, {
    service_ids: serviceIds,
  });
}

