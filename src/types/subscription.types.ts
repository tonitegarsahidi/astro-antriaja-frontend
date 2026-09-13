/**
 * Kontrak tipe data TypeScript untuk Subscription, Plan, Usage Stats, dan Invoices
 * Menyelaraskan DTO Backend AntriAja.
 */

export interface PlanResponse {
  id: string;
  code: 'free' | 'starter' | 'pro' | 'enterprise';
  name: string;
  description: string;
  price_monthly: number;
  max_counters: number;       // 0 = unlimited
  max_services: number;       // 0 = unlimited
  max_staff: number;          // 0 = unlimited
  max_daily_tickets: number;  // 0 = unlimited
  features: string[];
}

export interface UsageStats {
  counters_count: number;
  max_counters: number;
  services_count: number;
  max_services: number;
  staff_count: number;
  max_staff: number;
  today_tickets: number;
  max_daily_tickets: number;
}

export interface SubscriptionDetailResponse {
  id: string;
  tenant_id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled';
  current_period_start: string;
  current_period_end: string | null;
  plan: PlanResponse;
  usage: UsageStats;
}

export interface UpgradePlanRequest {
  plan_code: string;
}

export interface InvoiceResponse {
  id: string;
  tenant_id: string;
  invoice_number: string;
  amount: number;
  status: 'pending' | 'paid' | 'void';
  paid_at: string | null;
  due_date: string | null;
  created_at: string;
}
