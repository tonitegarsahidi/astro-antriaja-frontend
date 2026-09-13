export type TenantStatus = 'active' | 'suspended' | 'trial' | 'canceled';

export interface TenantProfileResponse {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  phone?: string | null;
  address?: string | null;
  timezone: string;
  logo_url?: string | null;
  daily_reset_time: string;
  transfer_ticket_mode: string;
  kiosk_key: string;
  display_key: string;
}

export interface UpdateTenantProfileRequest {
  name?: string;
  phone?: string | null;
  address?: string | null;
  timezone?: string;
  logo_url?: string | null;
  daily_reset_time?: string;
  transfer_ticket_mode?: string;
  new_vip_pin?: string;
}

export interface RotateDeviceKeyRequest {
  device_type: 'kiosk' | 'display';
}

export interface RotateDeviceKeyResponse {
  device_type: string;
  new_key: string;
}
