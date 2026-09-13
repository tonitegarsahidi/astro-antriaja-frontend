// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  getPlatformToken,
  setPlatformToken,
  removePlatformToken,
  getTenantSlug,
  setTenantSlug,
  removeTenantSlug,
  getDeviceKey,
  setDeviceKey,
  removeDeviceKey,
  getActiveCounterId,
  setActiveCounterId,
  removeActiveCounterId,
  getUser,
  setUser,
  removeUser,
  clearStorage,
} from '../src/lib/storage';
import type { UserResponse } from '../src/types/auth.types';

describe('storage utility (localStorage wrapper)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Token management', () => {
    it('sets, gets, and removes auth token', () => {
      expect(getToken()).toBeNull();
      setToken('mock-jwt-token-123');
      expect(getToken()).toBe('mock-jwt-token-123');
      removeToken();
      expect(getToken()).toBeNull();
    });

    it('sets, gets, and removes platform token separately', () => {
      expect(getPlatformToken()).toBeNull();
      setPlatformToken('mock-platform-token-456');
      expect(getPlatformToken()).toBe('mock-platform-token-456');
      expect(getToken()).toBeNull();
      removePlatformToken();
      expect(getPlatformToken()).toBeNull();
    });
  });

  describe('Tenant Slug management', () => {
    it('sets, gets, and removes tenant slug', () => {
      expect(getTenantSlug()).toBeNull();
      setTenantSlug('demo-bank');
      expect(getTenantSlug()).toBe('demo-bank');
      removeTenantSlug();
      expect(getTenantSlug()).toBeNull();
    });
  });

  describe('Device Key management', () => {
    it('manages kiosk key and display key separately', () => {
      expect(getDeviceKey('kiosk')).toBeNull();
      expect(getDeviceKey('display')).toBeNull();

      setDeviceKey('kiosk', 'kiosk-key-123');
      setDeviceKey('display', 'display-key-456');

      expect(getDeviceKey('kiosk')).toBe('kiosk-key-123');
      expect(getDeviceKey('display')).toBe('display-key-456');

      removeDeviceKey('kiosk');
      expect(getDeviceKey('kiosk')).toBeNull();
      expect(getDeviceKey('display')).toBe('display-key-456');
    });
  });

  describe('Active Counter ID', () => {
    it('sets, gets, and removes active counter id', () => {
      expect(getActiveCounterId()).toBeNull();
      setActiveCounterId('counter-uuid-789');
      expect(getActiveCounterId()).toBe('counter-uuid-789');
      removeActiveCounterId();
      expect(getActiveCounterId()).toBeNull();
    });
  });

  describe('User object management', () => {
    const mockUser: UserResponse = {
      id: 'usr-123',
      tenant_id: 'tnt-456',
      email: 'staff@antriaja.com',
      full_name: 'Siti Teller',
      role: 'staff',
      created_at: '2026-09-12T00:00:00Z',
    };

    it('stores and retrieves serialized user object', () => {
      expect(getUser()).toBeNull();
      setUser(mockUser);
      expect(getUser()).toEqual(mockUser);
      removeUser();
      expect(getUser()).toBeNull();
    });

    it('returns null if stored user JSON is corrupted', () => {
      localStorage.setItem('antriaja_user', 'invalid-json{');
      expect(getUser()).toBeNull();
    });
  });

  describe('clearStorage', () => {
    it('removes all antriaja keys from storage', () => {
      setToken('token');
      setTenantSlug('slug');
      setDeviceKey('kiosk', 'kiosk-key');
      setActiveCounterId('counter-id');

      clearStorage();

      expect(getToken()).toBeNull();
      expect(getTenantSlug()).toBeNull();
      expect(getDeviceKey('kiosk')).toBeNull();
      expect(getActiveCounterId()).toBeNull();
    });
  });

  describe('SSR / Exception resilience', () => {
    it('handles localStorage getItem throwing an error gracefully', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(getToken()).toBeNull();
      expect(getTenantSlug()).toBeNull();
    });
  });
});
