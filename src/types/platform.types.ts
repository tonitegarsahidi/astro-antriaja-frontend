export type PlatformAdminRole = 'superadmin' | 'staff';

export interface PlatformAdmin {
  id: string;
  email: string;
  full_name: string;
  role: PlatformAdminRole;
  is_active: boolean;
  last_login_at?: string;
  created_at?: string;
}

export interface PlatformLoginRequest {
  email: string;
  password: string;
}

export interface PlatformLoginResponse {
  token: string;
  admin: PlatformAdmin;
}

export interface PlatformMetricsResponse {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  trial_tenants: number;
  total_tickets_today: number;
}

export interface PlatformTenantListItem {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial';
  phone?: string;
  address?: string;
  timezone: string;
  total_services?: number;
  total_counters?: number;
  total_staff?: number;
  total_tickets_today?: number;
  created_at: string;
}

export interface PlatformPaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PlatformTenantListResponse {
  tenants: PlatformTenantListItem[];
  pagination: PlatformPaginationMeta;
}

export interface PlatformTenantDetailResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
    kiosk_key?: string;
    display_key?: string;
    transfer_ticket_mode?: string;
    daily_reset_time?: string;
    status: 'active' | 'suspended' | 'trial';
    phone?: string;
    address?: string;
    timezone: string;
    created_at: string;
  };
  admin?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  };
  stats: {
    total_staff: number;
    total_services: number;
    total_counters: number;
    total_tickets_today: number;
  };
}

export interface CreatePlatformTenantRequest {
  name: string;
  slug: string;
  admin_email: string;
  admin_password: string;
  admin_name: string;
  phone?: string;
  address?: string;
  timezone?: string;
}

export interface UpdatePlatformTenantStatusRequest {
  status: 'active' | 'suspended' | 'trial';
}

export interface RotatePlatformDeviceKeyRequest {
  device_type: 'kiosk' | 'display';
}

export interface RotatePlatformDeviceKeyResponse {
  device_type: 'kiosk' | 'display';
  new_key: string;
}

export interface ListPlatformTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PlatformDailyTrendItem {
  date: string;
  total_tickets: number;
  completed_tickets: number;
}

export interface PlatformTopTenantItem {
  rank: number;
  tenant_id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial';
  total_tickets: number;
  percentage: number;
}

export interface PlatformTicketAnalyticsSummary {
  total_tickets_all_time: number;
  total_tickets_today: number;
  total_tickets_yesterday: number;
  diff_percentage: number;
  avg_serving_time_mins: number;
}

export interface PlatformTicketAnalyticsResponse {
  summary: PlatformTicketAnalyticsSummary;
  daily_trend: PlatformDailyTrendItem[];
  top_tenants_today: PlatformTopTenantItem[];
  top_tenants_yesterday: PlatformTopTenantItem[];
}

