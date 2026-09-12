import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import IndexPage from '../src/pages/index.astro';

describe('AntriAja Page', () => {
  it('renders a single page with H1 containing "AntriAja"', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(IndexPage);

    expect(result).toContain('<h1>AntriAja</h1>');
    expect(result).toContain('<title>AntriAja</title>');
  });

  it('includes PWA webmanifest link and module script', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(IndexPage);

    expect(result).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(result).toContain('<script type="module"');
  });
});
