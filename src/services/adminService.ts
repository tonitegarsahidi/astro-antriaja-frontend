import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type { ResetQueueResponse } from '../types/queue.types';

/**
 * Memicu reset siklus antrian harian secara darurat/manual (khusus admin cabang).
 * Endpoint: POST /api/v1/admin/queues/reset
 */
export async function resetQueue(): Promise<ApiResponse<ResetQueueResponse>> {
  return httpClient.post<ResetQueueResponse>('/admin/queues/reset');
}
