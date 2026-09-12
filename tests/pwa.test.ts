import { describe, it, expect } from 'vitest';
import astroConfig, { pwaOptions } from '../astro.config.mjs';

describe('AntriAja PWA Configuration', () => {
  it('has PWA integration installed and configured', () => {
    const integrations = astroConfig.integrations || [];
    const pwaIntegration = integrations.find(
      (integration: any) => integration && integration.name === '@vite-pwa/astro-integration'
    );
    expect(pwaIntegration).toBeDefined();
  });

  it('configures complete PWA web manifest with icons, shortcuts, and theme color', () => {
    expect(pwaOptions).toBeDefined();
    const manifest = pwaOptions?.manifest as Record<string, any> | undefined;
    expect(manifest).toBeDefined();
    expect(manifest?.name).toBe('AntriAja - Sistem Antrian Modern');
    expect(manifest?.short_name).toBe('AntriAja');
    expect(manifest?.theme_color).toBe('#2563eb');
    expect(manifest?.display).toBe('standalone');
    expect(manifest?.icons).toHaveLength(3);
    expect(manifest?.shortcuts).toHaveLength(4);
  });

  it('configures Workbox runtime caching and offline navigateFallback', () => {
    expect(pwaOptions).toBeDefined();
    const workbox = pwaOptions?.workbox as Record<string, any> | undefined;
    expect(workbox).toBeDefined();
    expect(workbox?.navigateFallback).toBe('/offline');
    expect(workbox?.runtimeCaching).toBeDefined();
    expect(workbox?.runtimeCaching.length).toBeGreaterThan(0);
  });
});
