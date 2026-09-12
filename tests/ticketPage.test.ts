import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TicketPage from '../src/pages/ticket/index.astro';

describe('Ticket Mobile Page (ticket/index.astro)', () => {
  it('renders base layout shell and ticket portal wrapper', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(TicketPage);

    expect(result).toContain('<html lang="id">');
    expect(result).toContain('AntriAja');
    expect(result).toContain('ticket-viewport');
  });

  it('contains semantic elements for client-side state hydration', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(TicketPage);

    expect(result).toContain('id="ticket-loading"');
    expect(result).toContain('id="ticket-content"');
    expect(result).toContain('id="ticket-error"');
    expect(result).toContain('id="no-token-view"');
    expect(result).toContain('id="calling-alert-overlay"');
  });

  it('includes interactive client module script for SSE real-time connection', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(TicketPage);

    expect(result).toContain('<script type="module"');
  });
});
