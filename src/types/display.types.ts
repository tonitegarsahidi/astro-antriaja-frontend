export type MediaType = 'none' | 'image' | 'video';

export interface DisplaySettingsResponse {
  tenant_id: string;
  running_text: string;
  media_url?: string | null;
  media_type: MediaType;
  voice_enabled: boolean;
  updated_at: string;
}

export interface UpdateDisplaySettingsRequest {
  running_text?: string;
  media_url?: string | null;
  media_type?: MediaType;
  voice_enabled?: boolean;
}

export interface ActiveCallItem {
  counter_id: string;
  counter_number: number;
  counter_name: string;
  ticket_number: string;
  service_name: string;
  service_prefix: string;
  status: string;
  called_at?: string | null;
}

export interface RecentCallItem {
  ticket_number: string;
  counter_number?: number | null;
  counter_name?: string | null;
  service_name: string;
  service_prefix: string;
  called_at?: string | null;
}

export interface DisplaySnapshotResponse {
  tenant_name: string;
  tenant_slug: string;
  display_settings: DisplaySettingsResponse;
  active_calls: ActiveCallItem[];
  recent_calls: RecentCallItem[];
}
