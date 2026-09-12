import type { CounterStatus } from './master.types';

export type EventType =
  | 'CONNECTED'
  | 'TICKET_CREATED'
  | 'TICKET_CALLED'
  | 'TICKET_SERVING'
  | 'TICKET_HOLD'
  | 'TICKET_TRANSFERRED'
  | 'TICKET_COMPLETED'
  | 'COUNTER_STATUS_CHANGED'
  | 'DISPLAY_SETTINGS_UPDATED'
  | 'QUEUE_RESET';

export interface Event<T = unknown> {
  type: EventType;
  tenant_id: string;
  timestamp: string;
  payload: T;
}

export interface AudioInstruction {
  prefix: string;
  number: number;
  counter_number: number;
}

export interface TicketCalledPayload {
  ticket_id: string;
  ticket_number: string;
  counter_id: string;
  counter_number: number;
  counter_name: string;
  service_id: string;
  service_name: string;
  service_prefix: string;
  sequence_number: number;
  is_vip: boolean;
  call_type: 'call_next' | 'recall' | 'call_hold';
  audio: AudioInstruction;
}

export interface CounterStatusPayload {
  counter_id: string;
  counter_number: number;
  counter_name: string;
  status: CounterStatus;
  current_staff_id?: string | null;
}

export interface QueueResetPayload {
  reset_at: string;
  expired_tickets_count: number;
  counters_reset_count: number;
  manual_trigger: boolean;
}

export interface SSEAuthConfig {
  token?: string;
  deviceKey?: string;
  tenantSlug?: string;
  ticketToken?: string;
}

export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected';
