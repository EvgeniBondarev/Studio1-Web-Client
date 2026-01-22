import {useQuery} from '@tanstack/react-query';
import {articleService} from '../../api/TecDoc/api/services/article.service.ts';

interface UseArticleOptions {
  enabled?: boolean
  staleTime?: number
}

export function useArticleByExactMatch(
  supplierId?: number,
  code?: string,
  options?: UseArticleOptions
) {
  const query = useQuery({
    queryKey: ['article', supplierId, code],
    queryFn: () => articleService.getByExactMatch(supplierId!, code!),
    enabled: Boolean(supplierId && code) && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 10 * 60 * 1000,
  })

  const data = query.data
  const hasData = Boolean(data)

  return {
    ...query,
    hasData,
    // нормализованные данные
    article: data?.article,
    supplier: data?.supplier,
    crosses: data?.crosses ?? [],
    oeNumbers: data?.oeNumbers ?? [],
    attributes: data?.attributes ?? [],
    images: data?.images ?? [],
    linkages: data?.linkages ?? [],
    eanCodes: data?.eanCodes ?? [],
    information: data?.information ?? [],
    accessories: data?.accessories ?? [],
    newNumbers: data?.newNumbers ?? [],
  }
}