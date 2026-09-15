import type { ApiResponse } from '../types/api.types';
import { getToken, removeToken, removeUser, removePlatformToken } from './storage';

export interface RequestOptions extends RequestInit {
  deviceKey?: string;
  token?: string;
  skipAuthRedirect?: boolean;
}

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_BASE_URL) ||
      'http://localhost:8080/api/v1';
  }

  private handleUnauthorized(options?: RequestOptions): void {
    if (options?.skipAuthRedirect) return;
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname || '';
    if (pathname.includes('/login')) return;

    if (pathname.startsWith('/admin')) {
      removeToken();
      removeUser();
      window.location.href = '/admin/login';
    } else if (pathname.startsWith('/staff')) {
      removeToken();
      removeUser();
      window.location.href = '/staff/login';
    } else if (pathname.startsWith('/platform')) {
      removePlatformToken();
      window.location.href = '/platform/login';
    }
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private buildHeaders(options?: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Auto-inject JWT Bearer Token
    const authToken = options?.token || getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Auto-inject Device Key
    if (options?.deviceKey) {
      headers['X-Device-Key'] = options.deviceKey;
    }

    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  public async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let json: unknown;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      // Jika response JSON sesuai envelope standar backend
      if (
        json &&
        typeof json === 'object' &&
        'success' in json &&
        'data' in json &&
        'error' in json
      ) {
        const apiResponse = json as ApiResponse<T>;
        if (
          response.status === 401 ||
          apiResponse.error?.code === 'UNAUTHORIZED' ||
          apiResponse.error?.code === 'TOKEN_EXPIRED'
        ) {
          this.handleUnauthorized(options);
        }
        return apiResponse;
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.handleUnauthorized(options);
        }
        return {
          success: false,
          data: null,
          error: {
            code: `HTTP_${response.status}`,
            message: response.statusText || 'Terjadi kesalahan pada permintaan HTTP',
          },
        };
      }

      return {
        success: true,
        data: json as T,
        error: null,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Koneksi ke server gagal';
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: `Koneksi ke server gagal: ${errorMessage}`,
        },
      };
    }
  }

  public async get<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
