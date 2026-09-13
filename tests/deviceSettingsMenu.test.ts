import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import DeviceSettingsMenu from '../src/components/ui/DeviceSettingsMenu.astro';

describe('DeviceSettingsMenu Component (src/components/ui/DeviceSettingsMenu.astro)', () => {
  it('renders compact settings gear icon button', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DeviceSettingsMenu);

    expect(result).toContain('id="btn-device-settings"');
    expect(result).toContain('btn-setting-icon');
  });

  it('renders popover menu containing logout, fullscreen, and dark/light mode options', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(DeviceSettingsMenu);

    // Menu container
    expect(result).toContain('id="device-settings-menu"');

    // 1. Logout / Ganti Perangkat
    expect(result).toContain('id="btn-menu-logout"');
    expect(result).toMatch(/(Keluar|Ganti Perangkat|Reset)/i);

    // 2. Layar Penuh (Fullscreen)
    expect(result).toContain('id="btn-menu-fullscreen"');
    expect(result).toMatch(/(Layar Penuh|Fullscreen)/i);

    // 3. Toggle Mode Gelap / Terang
    expect(result).toContain('id="btn-menu-theme"');
    expect(result).toMatch(/(Mode Gelap|Mode Terang|Tema)/i);
  });
});
