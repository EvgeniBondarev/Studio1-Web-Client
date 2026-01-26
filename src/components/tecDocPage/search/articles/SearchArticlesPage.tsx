import type {ArticleSearchRequest, ArticleSearchResult} from '../../../../api/TecDoc/api/types.ts';
import { useState, useEffect, useCallback } from 'react'
import {useSearchParams, useNavigate, Link} from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Alert, Flex } from 'antd'
import {AlertOutlined} from '@ant-design/icons'
import '../../tecDoc.css'

import type {ApiError} from '../../../../api/TecDoc/api/client.ts';
import {articleSearchService} from '../../../../api/TecDoc/api/services/article-search.service.ts';
import {ArticleSearchForm} from './ArticleSearchForm.tsx';
import {saveSearchToHistory} from '../../../../api/TecDoc/utils/search-history.ts';
import {ArticleList} from '../../../ui/tecDoc/ArticleList.tsx';
import {ViewToggle} from '../../../ui/view-toggle.tsx';
import {getViewMode, setViewMode, type ViewMode} from '../../../../api/TecDoc/utils/view-preferences.ts';
import {Pagination} from '../../../ui/Pagination.tsx';
import {parseArticleSearchParams, ROUTE_GENERATE_TEC_DOC, ROUTE_TEC_DOC} from '../../constants/routes.ts';
import {PageLayout} from '../../../ui/tecDoc/PageLayout.tsx';
import {PageHeader} from '../../../ui/tecDoc/PageHeader.tsx';


const {  Text } = Typography

export  const SearchArticlesPage=()=> {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Читаем параметры из URL или из sessionStorage
  const getInitialParams = useCallback((): ArticleSearchRequest => {
    // 1. Пробуем взять из URL
    if ([...searchParams.keys()].length > 0) {
      return parseArticleSearchParams(searchParams)
    }

    // 2. Иначе — sessionStorage
    try {
      const saved = sessionStorage.getItem('articleSearchParams')
      if (saved) {
        return JSON.parse(saved) as ArticleSearchRequest
      }
    } catch {
      // ignore
    }

    // 3. Дефолты
    return {
      query: '',
      supplierId: undefined,
      sortBy: 'relevance',
      sortDescending: false,
      page: 1,
      pageSize: 20,
    }
  }, [searchParams])

  const [searchRequest, setSearchRequest] = useState<ArticleSearchRequest>(() =>
    getInitialParams()
  )

  const [currentSupplierName, setCurrentSupplierName] = useState<string | undefined>()
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return getViewMode()
    }
    return 'cards'
  })

  // Синхронизируем состояние с URL при изменении параметров URL
  useEffect(() => {
    setSearchRequest(getInitialParams())
  }, [searchParams, getInitialParams])


  // Функция для обновления URL параметров и sessionStorage
  const updateUrlParams = (request: ArticleSearchRequest) => {
    // 1. Сохраняем в sessionStorage
    try {
      sessionStorage.setItem(
        'articleSearchParams',
        JSON.stringify(request)
      )
    } catch {
      // ignore
    }

    // 2. Генерируем URL через роутер
    navigate(
      ROUTE_GENERATE_TEC_DOC.articleSearch(request)
    )
  }

  const { data, isLoading, error } = useQuery<ArticleSearchResult, ApiError>({
    queryKey: ['articleSearch', searchRequest],
    queryFn: () =>
      articleSearchService.search(searchRequest),
    enabled: !!searchRequest.query,
    staleTime: 5 * 60 * 1000, // 5 минут
  })

  const handleSearch = (request: ArticleSearchRequest) => {
    const newRequest = { ...request, page: 1 }
    updateUrlParams(newRequest)

    // Сохраняем в историю поиска
    saveSearchToHistory(newRequest, currentSupplierName)
  }

  const handleSupplierChange = (supplierName?: string) => {
    setCurrentSupplierName(supplierName)
  }

  const handlePageChange = (page: number) => {
    const newRequest = { ...searchRequest, page }
    updateUrlParams(newRequest)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
      <PageLayout
        header={
          <PageHeader
            title="Поиск артикулов"
            right={
              <Link to={ROUTE_TEC_DOC.INDEX} className="header-link">
                Главная
              </Link>
            }
          />
        }
      >

         {/* Search Form */}
        <Card
          title="Поиск артикулов"
          style={{
            marginBottom: 24,
            width:'100%',
          }}
        >
          <ArticleSearchForm
            key={`form-${searchRequest.supplierId || 'none'}`}
            onSubmit={handleSearch}
            isLoading={isLoading}
            initialQuery={searchRequest.query || ''}
            initialSupplierId={searchRequest.supplierId}
            initialSortBy={searchRequest.sortBy}
            initialSortDescending={searchRequest.sortDescending}
            onSupplierChange={handleSupplierChange}
          />
        </Card>

        {/* Error Display */}
        {error && (
          <Alert
            type="error"
            showIcon
            icon={<AlertOutlined />}
            message={`Ошибка: ${error.code}`}
            description={error.message}
            style={{
              marginBottom: 24,
            }}
          />
        )}

        {/* Results */}
        {data && (
          <>
            <Flex
              justify="space-between"
              align="center"
              style={{marginBottom: 16,}}
            >
              <Text type="secondary">
                Найдено: <b>{data.total}</b> артикулов
                {data.took && (
                  <span style={{marginLeft: 8, fontSize: 12, color: '#8c8c8c',}}>
                  (за {data.took} мс)
                  </span>
                )}
              </Text>

              <ViewToggle
                value={viewMode}
                onChange={(mode) => {
                  setViewModeState(mode)
                  setViewMode(mode)
                }}
              />
            </Flex>

            <ArticleList
              articles={data.items}
              isLoading={isLoading}
              viewMode={viewMode}
            />

            <Flex justify="center">
              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </Flex>
          </>
        )}

        {/* Empty state */}
        {!data && !isLoading && !error && (
          <Card
            style={{
              textAlign: 'center',
              padding: 24,
            }}
          >
            <Text type="secondary">
              Введите запрос для поиска артикулов
            </Text>
          </Card>
        )}
    </PageLayout>
  )
}
