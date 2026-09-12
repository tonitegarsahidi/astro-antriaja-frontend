// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCounterQueueState,
  callNext,
  recall,
  serve,
  hold,
  callHold,
  transfer,
  complete,
} from '../src/services/queueService';
import type {
  CounterQueueStateResponse,
  TicketResponse,
} from '../src/types/queue.types';

describe('queueService client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockTicket: TicketResponse = {
    id: 'tkt-1',
    tenant_id: 'tnt-456',
    service_id: 'srv-1',
    counter_id: 'ctr-1',
    ticket_number: 'A-001',
    sequence_number: 1,
    service_date: '2026-09-12',
    status: 'called',
    is_vip: false,
    token: 'tok-123',
    created_at: '2026-09-12T08:00:00Z',
    called_at: '2026-09-12T08:05:00Z',
  };

  const mockQueueState: CounterQueueStateResponse = {
    counter: {
      id: 'ctr-1',
      tenant_id: 'tnt-456',
      counter_number: 1,
      name: 'Loket 1 - Teller',
      status: 'serving',
      current_staff_id: 'usr-123',
      services: [],
      created_at: '2026-09-12T08:00:00Z',
      updated_at: '2026-09-12T08:00:00Z',
    },
    current_ticket: mockTicket,
    waiting_tickets: [
      {
        ...mockTicket,
        id: 'tkt-2',
        ticket_number: 'A-002',
        sequence_number: 2,
        status: 'waiting',
      },
    ],
    hold_tickets: [],
  };

  it('fetches counter queue state snapshot successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockQueueState,
        error: null,
      }),
    });

    const res = await getCounterQueueState('ctr-1');

    expect(res.success).toBe(true);
    expect(res.data?.counter.counter_number).toBe(1);
    expect(res.data?.current_ticket?.ticket_number).toBe('A-001');
    expect(res.data?.waiting_tickets).toHaveLength(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/state/ctr-1'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('calls next ticket (CallNext) successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockTicket,
        error: null,
      }),
    });

    const res = await callNext('ctr-1');

    expect(res.success).toBe(true);
    expect(res.data?.ticket_number).toBe('A-001');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/call-next'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ counter_id: 'ctr-1' }),
      })
    );
  });

  it('handles NO_TICKETS_WAITING (HTTP 404) when queue is empty', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'NO_TICKETS_WAITING',
          message: 'Tidak ada tiket antrian yang sedang menunggu saat ini',
        },
      }),
    });

    const res = await callNext('ctr-1');

    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('NO_TICKETS_WAITING');
  });

  it('recalls current ticket (Recall) successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockTicket,
        error: null,
      }),
    });

    const res = await recall('ctr-1', 'tkt-1');

    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/recall'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ counter_id: 'ctr-1', ticket_id: 'tkt-1' }),
      })
    );
  });

  it('starts serving visitor (StartServing) successfully', async () => {
    const servingTicket: TicketResponse = {
      ...mockTicket,
      status: 'serving',
      served_at: '2026-09-12T08:06:00Z',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: servingTicket,
        error: null,
      }),
    });

    const res = await serve('ctr-1', 'tkt-1');

    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('serving');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/serve'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ counter_id: 'ctr-1', ticket_id: 'tkt-1' }),
      })
    );
  });

  it('holds ticket (Hold) when visitor is no-show', async () => {
    const heldTicket: TicketResponse = {
      ...mockTicket,
      status: 'hold',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: heldTicket,
        error: null,
      }),
    });

    const res = await hold('ctr-1', 'tkt-1');

    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('hold');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/hold'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ counter_id: 'ctr-1', ticket_id: 'tkt-1' }),
      })
    );
  });

  it('calls back held ticket (CallHold) successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockTicket,
        error: null,
      }),
    });

    const res = await callHold('ctr-1', 'tkt-1');

    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/call-hold'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ counter_id: 'ctr-1', ticket_id: 'tkt-1' }),
      })
    );
  });

  it('transfers ticket to another service successfully', async () => {
    const transferredTicket: TicketResponse = {
      ...mockTicket,
      service_id: 'srv-2',
      ticket_number: 'B-001',
      is_vip: true,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: transferredTicket,
        error: null,
      }),
    });

    const res = await transfer('ctr-1', 'tkt-1', 'srv-2');

    expect(res.success).toBe(true);
    expect(res.data?.ticket_number).toBe('B-001');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/transfer'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          counter_id: 'ctr-1',
          ticket_id: 'tkt-1',
          target_service_id: 'srv-2',
        }),
      })
    );
  });

  it('completes ticket service (CompleteTicket) successfully', async () => {
    const completedTicket: TicketResponse = {
      ...mockTicket,
      status: 'completed',
      completed_at: '2026-09-12T08:15:00Z',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: completedTicket,
        error: null,
      }),
    });

    const res = await complete('ctr-1', 'tkt-1');

    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('completed');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/complete'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ counter_id: 'ctr-1', ticket_id: 'tkt-1' }),
      })
    );
  });
});
