import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type { PublicTicketResponse } from '../types/queue.types';

/**
 * Mengambil detail status tiket publik pengunjung berdasarkan token unik
 */
export async function getPublicTicketByToken(
  token: string
): Promise<ApiResponse<PublicTicketResponse>> {
  const safeToken = encodeURIComponent(token.trim());
  return httpClient.get<PublicTicketResponse>(`/public/tickets/${safeToken}`);
}
