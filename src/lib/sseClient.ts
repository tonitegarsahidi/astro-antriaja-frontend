import type {
  EventType,
  SSEAuthConfig,
  SSEConnectionStatus,
} from '../types/sse.types';
import { getToken, getTenantSlug, getDeviceKey } from './storage';

type EventHandler<T = unknown> = (payload: T) => void;
type StatusHandler = (status: SSEConnectionStatus) => void;

export class SSEClient {
  private eventSource: EventSource | null = null;
  private baseUrl: string;
  private status: SSEConnectionStatus = 'disconnected';
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private statusListeners: Set<StatusHandler> = new Set();
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 15000;
  private activeConfig: SSEAuthConfig | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SSE_BASE_URL) ||
      'http://localhost:8080/api/v1/events/stream';
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof EventSource !== 'undefined';
  }

  private setStatus(newStatus: SSEConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => listener(newStatus));
    }
  }

  public getStatus(): SSEConnectionStatus {
    return this.status;
  }

  public onStatusChange(handler: StatusHandler): () => void {
    this.statusListeners.add(handler);
    handler(this.status);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  private buildStreamUrl(config?: SSEAuthConfig): string {
    const url = new URL(this.baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const token = config?.token || getToken();
    const deviceKey = config?.deviceKey || getDeviceKey('display') || getDeviceKey('kiosk');
    const tenantSlug = config?.tenantSlug || getTenantSlug();
    const ticketToken = config?.ticketToken;

    if (token) {
      url.searchParams.set('token', token);
    } else if (deviceKey && tenantSlug) {
      url.searchParams.set('device_key', deviceKey);
      url.searchParams.set('tenant_slug', tenantSlug);
    } else if (ticketToken) {
      url.searchParams.set('ticket_token', ticketToken);
    }

    return url.toString();
  }

  public connect(config: SSEAuthConfig = {}): void {
    if (!this.isBrowser()) return;

    this.activeConfig = config;
    this.cleanup();
    this.setStatus('connecting');

    const streamUrl = this.buildStreamUrl(config);

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
      };

      this.eventSource.onerror = () => {
        this.setStatus('disconnected');
        this.cleanup();
        this.scheduleReconnect();
      };

      // Daftarkan listener event yang sudah terdaftar
      this.listeners.forEach((_, eventType) => {
        this.attachEventListener(eventType);
      });
    } catch {
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  private attachEventListener(eventType: string): void {
    if (!this.eventSource) return;

    this.eventSource.addEventListener(eventType, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        const handlers = this.listeners.get(eventType);
        if (handlers) {
          handlers.forEach((handler) => handler(parsed));
        }
      } catch {
        // Abaikan parse error atau raw strings
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) return;

    this.reconnectAttempts++;
    // Exponential backoff dengan jitter acak 1-2 detik
    const backoff = Math.min(1000 * 2 ** (this.reconnectAttempts - 1), this.maxReconnectDelay);
    const jitter = Math.floor(Math.random() * 1000);
    const delay = backoff + jitter;

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      if (this.activeConfig) {
        this.connect(this.activeConfig);
      }
    }, delay);
  }

  public on<T = unknown>(
    event: EventType | 'CONNECTED' | string,
    handler: EventHandler<T>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
      if (this.eventSource) {
        this.attachEventListener(event);
      }
    }

    const handlers = this.listeners.get(event)!;
    handlers.add(handler as EventHandler);

    return () => {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    this.cleanup();
    this.activeConfig = null;
    this.reconnectAttempts = 0;
    this.setStatus('disconnected');
  }
}

export const sseClient = new SSEClient();
