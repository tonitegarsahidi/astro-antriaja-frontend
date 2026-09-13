export interface DailyTrendItem {
  date: string;
  total_tickets: number;
  completed_tickets: number;
  avg_wait_seconds: number;
  avg_serve_seconds: number;
}

export interface AnalyticsSummaryResponse {
  total_tickets: number;
  completed_tickets: number;
  expired_tickets: number;
  hold_tickets: number;
  waiting_tickets: number;
  avg_wait_seconds: number;
  avg_serve_seconds: number;
  completion_rate: number;
  daily_trend: DailyTrendItem[];
}

export interface PeakHourItem {
  hour: number;
  ticket_count: number;
}

export interface ServiceAnalyticsItem {
  service_id: string;
  service_name: string;
  service_prefix: string;
  total_tickets: number;
  completed_tickets: number;
  expired_tickets: number;
  avg_wait_seconds: number;
  avg_serve_seconds: number;
  completion_rate: number;
}

export interface StaffAnalyticsItem {
  user_id: string;
  full_name: string;
  email: string;
  total_served: number;
  avg_serve_seconds: number;
}
