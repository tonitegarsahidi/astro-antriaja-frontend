import type { CounterResponse } from './master.types';

export type TicketStatus =
  | 'waiting'
  | 'called'
  | 'serving'
  | 'hold'
  | 'transferred'
  | 'completed'
  | 'expired';

export interface IssueTicketRequest {
  service_id: string;
}

export interface VerifyVIPPINRequest {
  service_id: string;
  pin: string;
}

export interface KioskServiceSummaryResponse {
  id: string;
  name: string;
  prefix: string;
  estimated_duration_mins: number;
  waiting_count: number;
}

export interface TicketResponse {
  id: string;
  tenant_id: string;
  service_id: string;
  counter_id?: string | null;
  ticket_number: string;
  sequence_number: number;
  service_date: string;
  status: TicketStatus;
  is_vip: boolean;
  token: string;
  transferred_from_ticket_id?: string | null;
  created_at: string;
  called_at?: string | null;
  served_at?: string | null;
  completed_at?: string | null;
}

export interface PublicTicketResponse extends TicketResponse {
  service_name: string;
  service_prefix: string;
  estimated_duration_mins: number;
  counter_number?: number | null;
  counter_name?: string | null;
  queue_ahead_count: number;
  estimated_wait_mins: number;
}

export interface CallNextRequest {
  counter_id: string;
}

export interface RecallRequest {
  counter_id: string;
  ticket_id: string;
}

export interface StartServingRequest {
  counter_id: string;
  ticket_id: string;
}

export interface HoldTicketRequest {
  counter_id: string;
  ticket_id: string;
}

export interface CallHoldRequest {
  counter_id: string;
  ticket_id: string;
}

export interface TransferTicketRequest {
  counter_id: string;
  ticket_id: string;
  target_service_id: string;
}

export interface CompleteTicketRequest {
  counter_id: string;
  ticket_id: string;
}

export interface CounterQueueStateResponse {
  counter: CounterResponse;
  current_ticket?: TicketResponse | null;
  waiting_tickets: TicketResponse[];
  hold_tickets: TicketResponse[];
}
