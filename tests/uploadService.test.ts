import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImage } from '../src/services/uploadService';

describe('Upload Service (uploadService.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects files that are not valid images', async () => {
    const textFile = new File(['hello world'], 'notes.txt', { type: 'text/plain' });
    const result = await uploadImage(textFile);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INVALID_FILE_TYPE');
    expect(result.error?.message).toContain('Format file harus berupa gambar');
  });

  it('rejects files exceeding 5MB limit', async () => {
    // 5.5 MB dummy content
    const largeContent = new Uint8Array(5.5 * 1024 * 1024);
    const largeFile = new File([largeContent], 'heavy.png', { type: 'image/png' });
    const result = await uploadImage(largeFile);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('FILE_TOO_LARGE');
    expect(result.error?.message).toContain('Ukuran file maksimal');
  });

  it('successfully uploads valid image file and returns uploaded URL', async () => {
    const validFile = new File(['fake-png-binary'], 'service-icon.png', { type: 'image/png' });

    const mockResponse = {
      success: true,
      data: {
        url: '/uploads/images/7c9e6679-7425-40de-944b-e07fc1f90ae7.png',
        filename: '7c9e6679-7425-40de-944b-e07fc1f90ae7.png',
        size: 15,
        mime_type: 'image/png',
      },
      error: null,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await uploadImage(validFile);

    expect(result.success).toBe(true);
    expect(result.data?.url).toBe('/uploads/images/7c9e6679-7425-40de-944b-e07fc1f90ae7.png');
    expect(result.data?.filename).toBe('7c9e6679-7425-40de-944b-e07fc1f90ae7.png');
  });

  it('handles server errors gracefully', async () => {
    const validFile = new File(['fake-jpg'], 'banner.jpg', { type: 'image/jpeg' });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        data: null,
        error: { code: 'UPLOAD_FAILED', message: 'Gagal memproses gambar' },
      }),
    });

    const result = await uploadImage(validFile);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
