import {useQuery} from '@tanstack/react-query';
import type {SupplierSearchResult} from '../../api/TecDoc/api/types.ts';
import type {ApiError} from '../../api/TecDoc/api/client.ts';
import {supplierSearchService} from '../../api/TecDoc/api/services/supplier-search.service.ts';
import {useArticleByExactMatch} from './useArticleByExactMatch.ts';

export function useArticleByBrandAndCode(
  brand?: string,
  code?: string
) {
  const supplierQuery = useQuery<SupplierSearchResult, ApiError>({
    queryKey: ['supplierSearch', brand],
    queryFn: () =>
      supplierSearchService.search({
        query: brand || null,
        page: 1,
        pageSize: 20,
        sortBy: 'relevance',
        sortDescending: false,
      }),
    enabled: Boolean(brand),
    staleTime: 5 * 60 * 1000,
  })

  const supplierId = supplierQuery.data?.items?.[0]?.supplierId

  const articleQuery = useArticleByExactMatch(
    supplierId,
    code,
    { enabled: Boolean(supplierId && code) }
  )

  return {
    supplierId,
    supplierQuery,
    ...articleQuery,
  }
}