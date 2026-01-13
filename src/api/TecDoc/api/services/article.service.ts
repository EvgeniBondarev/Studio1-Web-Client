import { apiClient } from '../client'
import {normalizeArticleNumber} from '../../utils.ts';
import type {ArticleDto, ArticleSearchParams, ArticleSearchResponseDto} from '../types.ts';

export class ArticleService {
  /**
   * Поиск артикулов по номеру через MySQL
   */
  async search(params: ArticleSearchParams): Promise<ArticleSearchResponseDto> {
    const validatedParams: ArticleSearchParams = {
      articleNumber: params.articleNumber.trim(),
      ...(params.supplierId && {
        supplierId: Math.max(1, Math.min(params.supplierId, 65535)),
      }),
    }

    return apiClient.get<ArticleSearchResponseDto>(
      '/api/v1/articles/search',
      {
        params: validatedParams,
      },
      false
    )
  }

  /**
   * Получение артикула по точному совпадению
   */
  async getByExactMatch(
    supplierId: number,
    articleNumber: string
  ): Promise<ArticleDto> {
    const validatedSupplierId = Math.max(1, Math.min(supplierId, 65535))
    const normalizedArticle = normalizeArticleNumber(articleNumber)

    return apiClient.get<ArticleDto>(
      `/api/v1/articles/${validatedSupplierId}/${normalizedArticle}`,
      undefined,
      false
    )
  }
}

export const articleService = new ArticleService()

