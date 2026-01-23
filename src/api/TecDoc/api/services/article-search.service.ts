import { apiClient } from '../client'
import type {ArticleSearchRequest, ArticleSearchResult, HealthStatus} from '../types.ts';

export class ArticleSearchService {
  /**
   * Поиск артикулов через Elasticsearch
   */
  async search(request: ArticleSearchRequest): Promise<ArticleSearchResult> {
    const validatedRequest: ArticleSearchRequest = {
      query: request.query || null,
      page: request.page || 1,
      pageSize: Math.min(request.pageSize || 20, 100),
      sortBy: request.sortBy || 'relevance',
      sortDescending: request.sortDescending || false,
      ...(request.supplierId && { supplierId: request.supplierId }),
    }

    return apiClient.post<ArticleSearchResult>(
      '/api/ArticleSearch/search',
      validatedRequest,
      undefined,
      true
    )
  }

  /**
   * Поиск артикулов по модели поставщика
   */
  async searchBySupplier(request: ArticleSearchRequest): Promise<ArticleSearchResult> {
    const validatedRequest: ArticleSearchRequest = {
      query: request.query || null,
      page: request.page || 1,
      pageSize: Math.min(request.pageSize || 20, 100),
      sortBy: request.sortBy || 'relevance',
      sortDescending: request.sortDescending || false,
      ...(request.supplierId && { supplierId: request.supplierId }),
    }

    return apiClient.post<ArticleSearchResult>(
      '/api/ArticleSearch/search-by-supplier',
      validatedRequest,
      undefined,
      true
    )
  }

  /**
   * Проверка состояния Elasticsearch индекса артикулов
   */
  async health(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>('/api/ArticleSearch/health', undefined, true)
  }
}

export const articleSearchService = new ArticleSearchService()

