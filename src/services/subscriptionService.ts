import { httpClient } from '../lib/httpClient';
import type { ApiResponse } from '../types/api.types';
import type {
  PlanResponse,
  SubscriptionDetailResponse,
  UpgradePlanRequest,
  InvoiceResponse,
} from '../types/subscription.types';

/**
 * Mengambil katalog seluruh paket langganan yang tersedia di platform.
 */
export async function getPlans(): Promise<ApiResponse<PlanResponse[]>> {
  return httpClient.get<PlanResponse[]>('/plans');
}

/**
 * Mengambil detail langganan aktif saat ini untuk tenant beserta statistik penggunaan kuota.
 */
export async function getCurrentSubscription(): Promise<ApiResponse<SubscriptionDetailResponse>> {
  return httpClient.get<SubscriptionDetailResponse>('/subscriptions/current');
}

/**
 * Melakukan upgrade atau pergantian paket langganan bagi tenant.
 */
export async function upgradePlan(
  req: UpgradePlanRequest
): Promise<ApiResponse<SubscriptionDetailResponse>> {
  return httpClient.post<SubscriptionDetailResponse>('/subscriptions/upgrade', req);
}

/**
 * Mengambil riwayat invoice / tagihan langganan tenant.
 */
export async function getInvoices(): Promise<ApiResponse<InvoiceResponse[]>> {
  return httpClient.get<InvoiceResponse[]>('/subscriptions/invoices');
}
