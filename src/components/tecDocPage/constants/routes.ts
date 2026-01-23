import type {ArticleSearchRequest} from '../../../api/TecDoc/api/types.ts';

export const ROUTE_TEC_DOC = {
    INDEX: '/tecdoc',
    SEARCH_ARTICLES: '/tecdoc/search/articles',
    SEARCH_SUPPLIERS: '/tecdoc/search/suppliers',
    ARTICLE_DETAIL: '/tecdoc/articles/:supplierId/:articleNumber/*',
    SUPPLIER_DETAIL: '/tecdoc/suppliers/:supplierId/*',
} as const;

export const parseArticleSearchParams = (
  searchParams: URLSearchParams
): ArticleSearchRequest => {
  // Сначала проверяем URL параметры
  const q = searchParams.get('q')
  const supplierId = searchParams.get('supplierId')
  const sortBy = searchParams.get('sortBy')
  const sortDescending = searchParams.get('sortDescending')
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')

  // Если есть параметры в URL, используем их
  return {
    query: q || '',
    supplierId: supplierId ? Number(supplierId) : undefined,
    sortBy: (sortBy as ArticleSearchRequest['sortBy']) || 'relevance',
    sortDescending: sortDescending === 'true',
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 20,
  }
}

export const ROUTE_GENERATE_TEC_DOC = {
    articleDetail: (supplierId: number, articleNumber: string) =>
      `/tecdoc/articles/${supplierId}/${articleNumber}`,
    supplierDetail: (supplierId: number) =>
      `/tecdoc/suppliers/${supplierId}`,
  articleSearch: (params?: Partial<ArticleSearchRequest>) => {
    if (!params) return ROUTE_TEC_DOC.SEARCH_ARTICLES

    const searchParams = new URLSearchParams()

    if (params.query) {
      searchParams.set('q', params.query)
    }

    if (params.supplierId !== undefined) {
      searchParams.set('supplierId', params.supplierId.toString())
    }

    if (params.sortBy && params.sortBy !== 'relevance') {
      searchParams.set('sortBy', params.sortBy)
    }

    if (params.sortDescending) {
      searchParams.set('sortDescending', 'true')
    }

    if (params.page && params.page > 1) {
      searchParams.set('page', params.page.toString())
    }

    if (params.pageSize && params.pageSize !== 20) {
      searchParams.set('pageSize', params.pageSize.toString())
    }

    const qs = searchParams.toString()
    return qs
      ? `${ROUTE_TEC_DOC.SEARCH_ARTICLES}?${qs}`
      : ROUTE_TEC_DOC.SEARCH_ARTICLES
  },
} as const;