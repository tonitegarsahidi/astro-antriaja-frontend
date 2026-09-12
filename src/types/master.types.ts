import type { UserResponse } from './auth.types';

export type CounterStatus = 'idle' | 'serving' | 'break';

export interface ServiceResponse {
  id: string;
  tenant_id: string;
  name: string;
  prefix: string;
  estimated_duration_mins: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  name: string;
  prefix: string;
  estimated_duration_mins: number;
}

export interface UpdateServiceRequest {
  name: string;
  prefix: string;
  estimated_duration_mins: number;
  is_active?: boolean;
}

export interface CounterResponse {
  id: string;
  tenant_id: string;
  counter_number: number;
  name: string;
  status: CounterStatus;
  current_staff_id?: string | null;
  services: ServiceResponse[];
  current_staff?: UserResponse | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCounterRequest {
  counter_number: number;
  name: string;
  service_ids: string[];
}

export interface UpdateCounterRequest {
  counter_number: number;
  name: string;
  status: CounterStatus;
}

export interface AssignServicesRequest {
  service_ids: string[];
}
