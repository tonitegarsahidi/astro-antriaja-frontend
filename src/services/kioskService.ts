import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type {
  KioskServiceSummaryResponse,
  TicketResponse,
} from '../types/queue.types';

/**
 * Mengambil ringkasan kategori layanan aktif & sisa antrian untuk kiosk
 */
export async function getKioskServices(
  tenantSlug: string,
  deviceKey?: string
): Promise<ApiResponse<KioskServiceSummaryResponse[]>> {
  const safeSlug = encodeURIComponent(tenantSlug.trim());
  return httpClient.get<KioskServiceSummaryResponse[]>(
    `/kiosk/${safeSlug}/services`,
    { deviceKey }
  );
}

/**
 * Menerbitkan nomor tiket antrian reguler baru via kiosk
 */
export async function issueKioskTicket(
  tenantSlug: string,
  serviceId: string,
  deviceKey?: string
): Promise<ApiResponse<TicketResponse>> {
  const safeSlug = encodeURIComponent(tenantSlug.trim());
  return httpClient.post<TicketResponse>(
    `/kiosk/${safeSlug}/tickets`,
    { service_id: serviceId },
    { deviceKey }
  );
}

/**
 * Memverifikasi PIN 6-digit VIP dan menerbitkan tiket antrian prioritas
 */
export async function verifyVIPPIN(
  tenantSlug: string,
  serviceId: string,
  pin: string,
  deviceKey?: string
): Promise<ApiResponse<TicketResponse>> {
  const safeSlug = encodeURIComponent(tenantSlug.trim());
  return httpClient.post<TicketResponse>(
    `/kiosk/${safeSlug}/verify-pin`,
    { service_id: serviceId, pin: pin.trim() },
    { deviceKey }
  );
}
