import type { UserResponse } from '../types/auth.types';

const STORAGE_KEYS = {
  TOKEN: 'antriaja_token',
  TENANT_SLUG: 'antriaja_tenant_slug',
  KIOSK_KEY: 'antriaja_kiosk_key',
  DISPLAY_KEY: 'antriaja_display_key',
  ACTIVE_COUNTER_ID: 'antriaja_active_counter_id',
  USER: 'antriaja_user',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Gracefully handle storage quota exceeded or disabled cookies
  }
}

function safeRemoveItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Gracefully ignore
  }
}

// Token
export function getToken(): string | null {
  return safeGetItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string): void {
  safeSetItem(STORAGE_KEYS.TOKEN, token);
}

export function removeToken(): void {
  safeRemoveItem(STORAGE_KEYS.TOKEN);
}

// Tenant Slug
export function getTenantSlug(): string | null {
  return safeGetItem(STORAGE_KEYS.TENANT_SLUG);
}

export function setTenantSlug(slug: string): void {
  safeSetItem(STORAGE_KEYS.TENANT_SLUG, slug);
}

export function removeTenantSlug(): void {
  safeRemoveItem(STORAGE_KEYS.TENANT_SLUG);
}

// Device Keys
export function getDeviceKey(type: 'kiosk' | 'display'): string | null {
  const key = type === 'kiosk' ? STORAGE_KEYS.KIOSK_KEY : STORAGE_KEYS.DISPLAY_KEY;
  return safeGetItem(key);
}

export function setDeviceKey(type: 'kiosk' | 'display', key: string): void {
  const storageKey = type === 'kiosk' ? STORAGE_KEYS.KIOSK_KEY : STORAGE_KEYS.DISPLAY_KEY;
  safeSetItem(storageKey, key);
}

export function removeDeviceKey(type: 'kiosk' | 'display'): void {
  const storageKey = type === 'kiosk' ? STORAGE_KEYS.KIOSK_KEY : STORAGE_KEYS.DISPLAY_KEY;
  safeRemoveItem(storageKey);
}

// Active Counter ID
export function getActiveCounterId(): string | null {
  return safeGetItem(STORAGE_KEYS.ACTIVE_COUNTER_ID);
}

export function setActiveCounterId(id: string): void {
  safeSetItem(STORAGE_KEYS.ACTIVE_COUNTER_ID, id);
}

export function removeActiveCounterId(): void {
  safeRemoveItem(STORAGE_KEYS.ACTIVE_COUNTER_ID);
}

// User Object
export function getUser(): UserResponse | null {
  const raw = safeGetItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export function setUser(user: UserResponse): void {
  try {
    safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {
    // Gracefully ignore
  }
}

export function removeUser(): void {
  safeRemoveItem(STORAGE_KEYS.USER);
}

// Clear all
export function clearStorage(): void {
  if (!isBrowser()) return;
  removeToken();
  removeTenantSlug();
  removeDeviceKey('kiosk');
  removeDeviceKey('display');
  removeActiveCounterId();
  removeUser();
}
