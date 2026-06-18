export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse {
  success: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
