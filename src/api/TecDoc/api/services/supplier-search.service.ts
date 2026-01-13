import { apiClient } from '../client'
import type {HealthStatus, SupplierSearchRequest, SupplierSearchResult} from '../types.ts';

export class SupplierSearchService {
  /**
   * Поиск поставщиков через Elasticsearch
   */
  async search(request: SupplierSearchRequest): Promise<SupplierSearchResult> {
    const validatedRequest: SupplierSearchRequest = {
      query: request.query || null,
      page: request.page || 1,
      pageSize: Math.min(request.pageSize || 20, 100),
      sortBy: request.sortBy || 'relevance',
      sortDescending: request.sortDescending || false,
    }

    return apiClient.post<SupplierSearchResult>(
      '/api/SupplierSearch/search',
      validatedRequest,
      undefined,
      true
    )
  }

  /**
   * Проверка состояния Elasticsearch индекса поставщиков
   */
  async health(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>('/api/SupplierSearch/health', undefined, true)
  }
}

export const supplierSearchService = new SupplierSearchService()

