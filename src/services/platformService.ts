import { HttpClient } from '../lib/httpClient';
import { getPlatformToken } from '../lib/storage';
import type { ApiResponse } from '../types/api.types';
import type {
  PlatformLoginRequest,
  PlatformLoginResponse,
  PlatformAdmin,
  PlatformMetricsResponse,
  PlatformTenantListResponse,
  PlatformTenantDetailResponse,
  CreatePlatformTenantRequest,
  RotatePlatformDeviceKeyResponse,
  ListPlatformTenantsParams,
  PlatformTicketAnalyticsResponse,
} from '../types/platform.types';

const http = new HttpClient();

/**
 * Autentikasi staf platform / super-admin
 */
export async function platformLogin(
  req: PlatformLoginRequest
): Promise<ApiResponse<PlatformLoginResponse>> {
  return http.request<PlatformLoginResponse>('/platform/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * Mengambil data profil staf super-admin yang sedang aktif login
 */
export async function getPlatformMe(): Promise<ApiResponse<PlatformAdmin>> {
  return http.request<PlatformAdmin>('/platform/auth/me', {
    method: 'GET',
    token: getPlatformToken() || undefined,
  });
}

/**
 * Mengambil ringkasan metrik global platform
 */
export async function getPlatformMetrics(): Promise<ApiResponse<PlatformMetricsResponse>> {
  return http.request<PlatformMetricsResponse>('/platform/metrics', {
    method: 'GET',
    token: getPlatformToken() || undefined,
  });
}

/**
 * Mengambil daftar seluruh tenant dengan filter & paginasi
 */
export async function listPlatformTenants(
  params?: ListPlatformTenantsParams
): Promise<ApiResponse<PlatformTenantListResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.search) {
    queryParams.set('search', params.search);
    queryParams.set('query', params.search);
  }
  if (params?.status) queryParams.set('status', params.status);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await http.request<any>(`/platform/tenants${queryStr}`, {
    method: 'GET',
    token: getPlatformToken() || undefined,
  });

  if (res.success && res.data) {
    const tenants = res.data.tenants || res.data.items || [];
    return {
      ...res,
      data: {
        ...res.data,
        tenants,
        items: tenants,
      },
    };
  }

  return res;
}

/**
 * Mengambil rincian mendalam tenant beserta statistik operasionalnya
 */
export async function getPlatformTenant(
  id: string
): Promise<ApiResponse<PlatformTenantDetailResponse>> {
  const res = await http.request<any>(`/platform/tenants/${id}`, {
    method: 'GET',
    token: getPlatformToken() || undefined,
  });

  if (res.success && res.data) {
    const data = res.data;
    const stats = data.stats || {
      total_staff: data.total_staff ?? 0,
      total_services: data.total_services ?? 0,
      total_counters: data.total_counters ?? 0,
      total_tickets_today: data.total_tickets_today ?? 0,
    };
    return {
      ...res,
      data: {
        ...data,
        stats,
      },
    };
  }

  return res;
}

/**
 * Membuat dan mem-provisioning instansi tenant baru dari konsol platform
 */
export async function createPlatformTenant(
  req: CreatePlatformTenantRequest
): Promise<ApiResponse<{ tenant: any; admin?: any }>> {
  return http.request<{ tenant: any; admin?: any }>('/platform/tenants', {
    method: 'POST',
    body: JSON.stringify(req),
    token: getPlatformToken() || undefined,
  });
}

/**
 * Memperbarui status operasional tenant (misal suspend, resume, trial)
 */
export async function updatePlatformTenantStatus(
  id: string,
  status: 'active' | 'suspended' | 'trial',
  reason?: string
): Promise<ApiResponse<{ message: string; tenant_id?: string; status: string }>> {
  return http.request<{ message: string; tenant_id?: string; status: string }>(
    `/platform/tenants/${id}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
      token: getPlatformToken() || undefined,
    }
  );
}

/**
 * Merotasi kunci perangkat tenant (kiosk atau display)
 */
export async function rotatePlatformDeviceKey(
  id: string,
  deviceType: 'kiosk' | 'display'
): Promise<ApiResponse<RotatePlatformDeviceKeyResponse>> {
  return http.request<RotatePlatformDeviceKeyResponse>(
    `/platform/tenants/${id}/rotate-keys`,
    {
      method: 'POST',
      body: JSON.stringify({ device_type: deviceType }),
      token: getPlatformToken() || undefined,
    }
  );
}

/**
 * Menonaktifkan / soft-delete tenant
 */
export async function deletePlatformTenant(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return http.request<{ message: string }>(`/platform/tenants/${id}`, {
    method: 'DELETE',
    token: getPlatformToken() || undefined,
  });
}

/**
 * Mengambil statistik volume tiket, grafik harian, dan top 10 tenant teraktif
 */
export async function getPlatformTicketAnalytics(
  days: number = 14
): Promise<ApiResponse<PlatformTicketAnalyticsResponse>> {
  return http.request<PlatformTicketAnalyticsResponse>(
    `/platform/analytics/tickets?days=${days}`,
    {
      method: 'GET',
      token: getPlatformToken() || undefined,
    }
  );
}

