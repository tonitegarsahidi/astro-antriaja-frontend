import { describe, it, expect } from 'vitest';
import astroConfig from '../astro.config.mjs';

describe('AntriAja PWA Configuration', () => {
  it('has PWA integration installed and configured', () => {
    const integrations = astroConfig.integrations || [];
    const pwaIntegration = integrations.find(
      (integration: any) => integration && integration.name === '@vite-pwa/astro-integration'
    );
    expect(pwaIntegration).toBeDefined();
  });
});
