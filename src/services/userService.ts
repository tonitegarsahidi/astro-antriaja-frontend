import { httpClient } from '../lib/httpClient';
import type { ApiResponse, PaginatedData } from '../types/api.types';
import type {
  StaffResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '../types/user.types';

/**
 * Mengambil daftar staf di bawah tenant yang sedang login.
 */
export async function listStaff(
  page: number = 1,
  limit: number = 10,
  active?: boolean
): Promise<ApiResponse<PaginatedData<StaffResponse>>> {
  let endpoint = `/users?page=${page}&limit=${limit}`;
  if (typeof active === 'boolean') {
    endpoint += `&active=${active}`;
  }
  return httpClient.get<PaginatedData<StaffResponse>>(endpoint);
}

/**
 * Mengambil data detail staf berdasarkan ID.
 */
export async function getStaff(id: string): Promise<ApiResponse<StaffResponse>> {
  return httpClient.get<StaffResponse>(`/users/${id}`);
}

/**
 * Mendaftarkan akun staf baru.
 */
export async function createStaff(
  req: CreateStaffRequest
): Promise<ApiResponse<StaffResponse>> {
  return httpClient.post<StaffResponse>('/users', req);
}

/**
 * Memperbarui data akun staf (nama, status aktif, password).
 */
export async function updateStaff(
  id: string,
  req: UpdateStaffRequest
): Promise<ApiResponse<StaffResponse>> {
  return httpClient.put<StaffResponse>(`/users/${id}`, req);
}

/**
 * Menonaktifkan akun staf (soft-deactivate).
 */
export async function deactivateStaff(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  return httpClient.delete<{ message: string }>(`/users/${id}`);
}
