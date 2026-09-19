import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseLayout from '../src/layouts/BaseLayout.astro';

describe('BaseLayout container testing', () => {
  it('renders default title and html structure with Indonesian lang', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BaseLayout, {
      props: { title: 'Layanan Antrian' },
    });

    expect(result).toContain('<html lang="id">');
    expect(result).toContain('<title>Layanan Antrian | AntriAja</title>');
    expect(result).toContain('<meta name="theme-color" content="#2563eb"');
  });

  it('renders children slot content inside the layout body', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BaseLayout, {
      props: { title: 'Test Slot' },
      slots: {
        default: '<div id="test-content">Halo AntriAja</div>',
      },
    });

    expect(result).toContain('<div id="test-content">Halo AntriAja</div>');
  });

  it('includes design tokens in CSS variables (:root)', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BaseLayout, {
      props: { title: 'Design System' },
    });

    expect(result).toContain('--color-primary: #2563eb');
    expect(result).toContain('--font-sans:');
  });

  it('does not include destructive universal resets that break Tailwind utility cascade', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BaseLayout);

    // Ensure universal reset * { margin: 0; padding: 0; } is removed so Tailwind p-*, m-* classes work
    expect(result).not.toContain('padding: 0;\n  }');
    expect(result).not.toContain('border: none;\n    background: none;');
  });

  describe('DisplayLayout container testing', () => {
    it('renders header logo badge with image element and default fallback SVG icon', async () => {
      const container = await AstroContainer.create();
      const DisplayLayout = (await import('../src/layouts/DisplayLayout.astro')).default;
      const result = await container.renderToString(DisplayLayout, {
        props: {
          title: 'Layar Antrian TV',
          tenantName: 'RSUD Sehat Selalu',
        },
      });

      expect(result).toContain('id="display-brand-logo-badge"');
      expect(result).toContain('id="display-tenant-logo-img"');
      expect(result).toContain('id="display-default-logo-icon"');
      expect(result).toContain('id="display-tenant-name"');
      expect(result).toContain('RSUD Sehat Selalu');
    });
  });
});
