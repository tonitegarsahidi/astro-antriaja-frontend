/**
 * Standard API Response Envelope dari backend AntriAja
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}
