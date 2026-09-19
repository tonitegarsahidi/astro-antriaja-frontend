import type { ApiResponse } from '../types/api.types';
import { getToken } from '../lib/storage';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Mengunggah file gambar ke backend AntriAja.
 * Melakukan validasi awal pada sisi klien (tipe berkas & ukuran maksimal 5 MB),
 * lalu mengirim berkas via multipart/form-data.
 */
export async function uploadImage(file: File): Promise<ApiResponse<UploadResult>> {
  // 1. Validasi tipe berkas
  if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return {
      success: false,
      data: null,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Format file harus berupa gambar (PNG, JPG, WEBP, GIF)',
      },
    };
  }

  // 2. Validasi batas ukuran berkas
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      data: null,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'Ukuran file maksimal adalah 5 MB',
      },
    };
  }

  // 3. Siapkan multipart form data
  const formData = new FormData();
  formData.append('image', file);

  const baseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_API_BASE_URL) ||
    'http://localhost:8080/api/v1';

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = `${cleanBase}/uploads/image`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (
      json &&
      typeof json === 'object' &&
      'success' in json &&
      'data' in json &&
      'error' in json
    ) {
      return json as ApiResponse<UploadResult>;
    }

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Gagal mengunggah gambar',
        },
      };
    }

    return {
      success: true,
      data: json as UploadResult,
      error: null,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Koneksi ke server gagal';
    return {
      success: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: `Gagal mengunggah berkas: ${errorMessage}`,
      },
    };
  }
}
