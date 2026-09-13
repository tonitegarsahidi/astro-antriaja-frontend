import { HttpClient } from '../lib/httpClient';
import { getToken } from '../lib/storage';
import type { ApiResponse } from '../types/api.types';
import type {
  AnalyticsSummaryResponse,
  PeakHourItem,
  ServiceAnalyticsItem,
  StaffAnalyticsItem,
} from '../types/analytics.types';

const http = new HttpClient();

/**
 * Mengambil ringkasan metrik analitik dan tren harian
 */
export async function getAnalyticsSummary(
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<AnalyticsSummaryResponse>> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('start_date', startDate);
  if (endDate) queryParams.set('end_date', endDate);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return http.request<AnalyticsSummaryResponse>(`/analytics/summary${queryStr}`, {
    method: 'GET',
    token: getToken() || undefined,
  });
}

/**
 * Mengambil distribusi jam sibuk 24-jam (peak hours)
 */
export async function getPeakHours(
  date?: string
): Promise<ApiResponse<PeakHourItem[]>> {
  const queryParams = new URLSearchParams();
  if (date) queryParams.set('date', date);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return http.request<PeakHourItem[]>(`/analytics/peak-hours${queryStr}`, {
    method: 'GET',
    token: getToken() || undefined,
  });
}

/**
 * Mengambil performa operasional per kategori layanan
 */
export async function getServiceMetrics(
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<ServiceAnalyticsItem[]>> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('start_date', startDate);
  if (endDate) queryParams.set('end_date', endDate);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return http.request<ServiceAnalyticsItem[]>(`/analytics/services${queryStr}`, {
    method: 'GET',
    token: getToken() || undefined,
  });
}

/**
 * Mengambil produktivitas dan kecepatan kerja per staf petugas
 */
export async function getStaffPerformance(
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<StaffAnalyticsItem[]>> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('start_date', startDate);
  if (endDate) queryParams.set('end_date', endDate);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return http.request<StaffAnalyticsItem[]>(`/analytics/staff${queryStr}`, {
    method: 'GET',
    token: getToken() || undefined,
  });
}

/**
 * Mengunduh berkas CSV laporan operasional antrian
 */
export async function exportAnalyticsCSV(
  startDate?: string,
  endDate?: string
): Promise<string> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set('start_date', startDate);
  if (endDate) queryParams.set('end_date', endDate);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const baseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_BASE_URL) ||
    'http://localhost:8080/api/v1';
  const url = `${baseUrl}/analytics/export/csv${queryStr}`;
  const token = getToken();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/csv',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Gagal mengunduh berkas CSV laporan analitik');
  }

  return response.text();
}
