// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SSEClient } from '../src/lib/sseClient';

describe('SSEClient utility', () => {
  let mockEventSourceInstances: any[] = [];

  class MockEventSource {
    public url: string;
    public onopen: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public listeners: Map<string, Function> = new Map();
    public closed = false;

    constructor(url: string) {
      this.url = url;
      mockEventSourceInstances.push(this);
    }

    addEventListener(event: string, callback: Function) {
      this.listeners.set(event, callback);
    }

    close() {
      this.closed = true;
    }
  }

  beforeEach(() => {
    mockEventSourceInstances = [];
    vi.stubGlobal('EventSource', MockEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('initializes with disconnected status', () => {
    const client = new SSEClient('http://localhost:8080/api/v1/events/stream');
    expect(client.getStatus()).toBe('disconnected');
  });

  it('builds stream url with token parameter when connecting with token', () => {
    const client = new SSEClient('http://localhost:8080/api/v1/events/stream');
    client.connect({ token: 'test-jwt' });

    expect(mockEventSourceInstances.length).toBe(1);
    expect(mockEventSourceInstances[0].url).toContain('token=test-jwt');
    expect(client.getStatus()).toBe('connecting');
  });

  it('builds stream url with device_key and tenant_slug for TV/Kiosk', () => {
    const client = new SSEClient('http://localhost:8080/api/v1/events/stream');
    client.connect({ deviceKey: 'kiosk-key', tenantSlug: 'demo-bank' });

    expect(mockEventSourceInstances[0].url).toContain('device_key=kiosk-key');
    expect(mockEventSourceInstances[0].url).toContain('tenant_slug=demo-bank');
  });

  it('builds stream url with ticket_token for mobile visitor', () => {
    const client = new SSEClient('http://localhost:8080/api/v1/events/stream');
    client.connect({ ticketToken: 'ticket-token-123' });

    expect(mockEventSourceInstances[0].url).toContain('ticket_token=ticket-token-123');
  });

  it('updates status to connected when onopen fires', () => {
    const client = new SSEClient('http://localhost:8080/api/v1/events/stream');
    let capturedStatus = '';
    client.onStatusChange((status) => {
      capturedStatus = status;
    });

    client.connect({ token: 'test' });
    expect(capturedStatus).toBe('connecting');

    mockEventSourceInstances[0].onopen();
    expect(capturedStatus).toBe('connected');
    expect(client.getStatus()).toBe('connected');
  });

  it('dispatches parsed payload to registered event listeners', () => {
    const client = new SSEClient('http://localhost:8080/api/v1/events/stream');
    const calledHandler = vi.fn();

    client.on('TICKET_CALLED', calledHandler);
    client.connect({ token: 'test' });

    const mockPayload = { ticket_number: 'A-001', counter_number: 1 };
    const listener = mockEventSourceInstances[0].listeners.get('TICKET_CALLED');
    expect(listener).toBeDefined();

    listener({ data: JSON.stringify(mockPayload) });
    expect(calledHandler).toHaveBeenCalledWith(mockPayload);
  });

  it('closes event source and resets status on disconnect', () => {
    const client = new SSEClient('http://localhost:8080/api/v1/events/stream');
    client.connect({ token: 'test' });

    const instance = mockEventSourceInstances[0];
    client.disconnect();

    expect(instance.closed).toBe(true);
    expect(client.getStatus()).toBe('disconnected');
  });
});
