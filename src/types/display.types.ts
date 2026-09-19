export type MediaType = 'none' | 'image' | 'video';

export type BellSoundType =
  | 'ding_dong'
  | 'tri_tone'
  | 'airport'
  | 'single_ting'
  | 'soft_pulse'
  | 'marimba'
  | 'none';

export type VoiceLanguage = 'id-ID' | 'en-US';
export type VoiceGender = 'female' | 'male';

export interface DisplaySettingsResponse {
  tenant_id: string;
  running_text: string;
  media_url?: string | null;
  media_type: MediaType;
  voice_enabled: boolean;
  bell_sound: BellSoundType;
  voice_lang: VoiceLanguage;
  voice_gender: VoiceGender;
  voice_pitch: number;
  voice_rate: number;
  updated_at: string;
}

export interface UpdateDisplaySettingsRequest {
  running_text?: string;
  media_url?: string | null;
  media_type?: MediaType;
  voice_enabled?: boolean;
  bell_sound?: BellSoundType;
  voice_lang?: VoiceLanguage;
  voice_gender?: VoiceGender;
  voice_pitch?: number;
  voice_rate?: number;
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
  tenant_logo_url?: string | null;
  display_settings: DisplaySettingsResponse;
  active_calls: ActiveCallItem[];
  recent_calls: RecentCallItem[];
}
