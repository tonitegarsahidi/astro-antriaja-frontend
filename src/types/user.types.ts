import type { PaginationMeta } from './api.types';

export interface StaffResponse {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface UpdateStaffRequest {
  full_name?: string;
  is_active?: boolean;
  password?: string;
}

export interface StaffListResponse {
  items: StaffResponse[];
  pagination: PaginationMeta;
}
