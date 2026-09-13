import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterTenantRequest,
  RegisterTenantResponse,
} from '../types/auth.types';

/**
 * Mendaftarkan instansi tenant baru beserta user admin pertama.
 */
export async function registerTenant(
  data: RegisterTenantRequest
): Promise<ApiResponse<RegisterTenantResponse>> {
  return httpClient.post<RegisterTenantResponse>('/auth/register-tenant', data);
}

/**
 * Melakukan login staf/admin instansi menggunakan email, password, dan tenant slug.
 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return httpClient.post<LoginResponse>('/auth/login', data);
}

/**
 * Mengambil informasi akun dan profil instansi dari user yang sedang login via Bearer token.
 */
export async function getMe(): Promise<ApiResponse<MeResponse>> {
  return httpClient.get<MeResponse>('/auth/me');
}
