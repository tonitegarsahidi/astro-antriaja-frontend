export type UserRole = 'admin' | 'staff';

export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  kiosk_key: string;
  display_key: string;
  transfer_ticket_mode: string;
  daily_reset_time: string;
  created_at: string;
}

export interface UserResponse {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface RegisterTenantRequest {
  name: string;
  slug: string;
  admin_email: string;
  admin_password: string;
  admin_name: string;
  vip_pin?: string;
  daily_reset_time?: string;
}

export interface RegisterTenantResponse {
  tenant: TenantResponse;
  admin: UserResponse;
  token: string;
}

export interface LoginRequest {
  tenant_slug: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
  tenant: TenantResponse;
}

export interface MeResponse {
  user: UserResponse;
  tenant: TenantResponse;
}
