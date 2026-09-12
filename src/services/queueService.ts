import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type {
  CounterQueueStateResponse,
  TicketResponse,
  CallNextRequest,
  RecallRequest,
  StartServingRequest,
  HoldTicketRequest,
  CallHoldRequest,
  TransferTicketRequest,
  CompleteTicketRequest,
} from '../types/queue.types';

/**
 * Mengambil snapshot kondisi antrian loket: loket info, tiket aktif, daftar waiting, dan daftar hold.
 */
export async function getCounterQueueState(
  counterId: string
): Promise<ApiResponse<CounterQueueStateResponse>> {
  return httpClient.get<CounterQueueStateResponse>(`/queue/state/${counterId}`);
}

/**
 * Memanggil tiket antrian berikutnya sesuai prioritas (VIP teratas lalu FIFO).
 */
export async function callNext(counterId: string): Promise<ApiResponse<TicketResponse>> {
  const body: CallNextRequest = { counter_id: counterId };
  return httpClient.post<TicketResponse>('/queue/call-next', body);
}

/**
 * Memanggil ulang pengunjung untuk nomor antrian yang sedang dipanggil saat ini.
 */
export async function recall(
  counterId: string,
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  const body: RecallRequest = { counter_id: counterId, ticket_id: ticketId };
  return httpClient.post<TicketResponse>('/queue/recall', body);
}

/**
 * Memulai proses pelayanan pengunjung di meja loket (mengaktifkan timer stopwatch).
 */
export async function serve(
  counterId: string,
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  const body: StartServingRequest = { counter_id: counterId, ticket_id: ticketId };
  return httpClient.post<TicketResponse>('/queue/serve', body);
}

/**
 * Menunda tiket yang tidak merespons (no-show) ke dalam daftar tunda loket.
 */
export async function hold(
  counterId: string,
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  const body: HoldTicketRequest = { counter_id: counterId, ticket_id: ticketId };
  return httpClient.post<TicketResponse>('/queue/hold', body);
}

/**
 * Memanggil kembali tiket yang sebelumnya ditunda dari daftar tunda loket.
 */
export async function callHold(
  counterId: string,
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  const body: CallHoldRequest = { counter_id: counterId, ticket_id: ticketId };
  return httpClient.post<TicketResponse>('/queue/call-hold', body);
}

/**
 * Mengalihkan pengunjung yang telah dilayani ke kategori layanan lain.
 */
export async function transfer(
  counterId: string,
  ticketId: string,
  targetServiceId: string
): Promise<ApiResponse<TicketResponse>> {
  const body: TransferTicketRequest = {
    counter_id: counterId,
    ticket_id: ticketId,
    target_service_id: targetServiceId,
  };
  return httpClient.post<TicketResponse>('/queue/transfer', body);
}

/**
 * Menyelesaikan proses pelayanan tiket antrian dan mengembalikan status loket menjadi idle.
 */
export async function complete(
  counterId: string,
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  const body: CompleteTicketRequest = { counter_id: counterId, ticket_id: ticketId };
  return httpClient.post<TicketResponse>('/queue/complete', body);
}
