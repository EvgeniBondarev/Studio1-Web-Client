import type {ArticleSearchRequest, ArticleSearchResult} from '../../../../api/TecDoc/api/types.ts';
import { useState, useEffect, useMemo, useCallback } from 'react'
import {useSearchParams, useNavigate, Link} from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Layout, Card, Typography, Alert, Flex } from 'antd'
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


const { Header, Content } = Layout
const { Title, Text } = Typography

export  const SearchArticlesPage=()=> {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Читаем параметры из URL или из sessionStorage
  const getInitialParams = useCallback(() => {
    // Сначала проверяем URL параметры
    const q = searchParams.get('q')
    const supplierId = searchParams.get('supplierId')
    const sortBy = searchParams.get('sortBy')
    const sortDescending = searchParams.get('sortDescending')
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    // Если есть параметры в URL, используем их
    if (q !== null || supplierId !== null || sortBy !== null || sortDescending !== null || page !== null || pageSize !== null) {
      return {
        query: q || '',
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        sortBy: (sortBy as 'relevance' | 'foundString' | 'description') || 'relevance',
        sortDescending: sortDescending === 'true',
        page: parseInt(page || '1'),
        pageSize: parseInt(pageSize || '20'),
      }
    }


    // Иначе пытаемся восстановить из sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('articleSearchParams')
        if (saved) {
          const parsed = JSON.parse(saved)
          return {
            query: parsed.query || '',
            supplierId: parsed.supplierId,
            sortBy: parsed.sortBy || 'relevance',
            sortDescending: parsed.sortDescending || false,
            page: parsed.page || 1,
            pageSize: parsed.pageSize || 20,
          }
        }
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }

    // Значения по умолчанию
    return {
      query: '',
      supplierId: undefined,
      sortBy: 'relevance' as const,
      sortDescending: false,
      page: 1,
      pageSize: 20,
    }
  }, [searchParams])

  const initialParams = useMemo(() => getInitialParams(), [getInitialParams])

  const [searchRequest, setSearchRequest] = useState<ArticleSearchRequest>({
    query: initialParams.query,
    page: initialParams.page,
    pageSize: initialParams.pageSize,
    sortBy: initialParams.sortBy,
    sortDescending: initialParams.sortDescending,
    supplierId: initialParams.supplierId,
  })

  const [currentSupplierName, setCurrentSupplierName] = useState<string | undefined>()
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return getViewMode()
    }
    return 'cards'
  })

  // Синхронизируем состояние с URL при изменении параметров URL
  useEffect(() => {
    const params = getInitialParams()
    setSearchRequest({
      query: params.query,
      page: params.page,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDescending: params.sortDescending,
      supplierId: params.supplierId,
    })
  }, [searchParams, getInitialParams])


  // Функция для обновления URL параметров и sessionStorage
  const updateUrlParams = (request: ArticleSearchRequest) => {
    const params = new URLSearchParams()

    if (request.query) {
      params.set('q', request.query)
    }

    if (request.supplierId !== undefined) {
      params.set('supplierId', request.supplierId.toString())
    }

    if (request.sortBy && request.sortBy !== 'relevance') {
      params.set('sortBy', request.sortBy)
    }

    if (request.sortDescending) {
      params.set('sortDescending', 'true')
    }

    if (request.page && request.page > 1) {
      params.set('page', request.page.toString())
    }

    if (request.pageSize && request.pageSize !== 20) {
      params.set('pageSize', request.pageSize.toString())
    }

    // Сохраняем параметры в sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('articleSearchParams', JSON.stringify({
          query: request.query || '',
          supplierId: request.supplierId,
          sortBy: request.sortBy,
          sortDescending: request.sortDescending,
          page: request.page,
          pageSize: request.pageSize,
        }))
      } catch (e) {
        // Игнорируем ошибки сохранения
      }
    }

    const newUrl = params.toString() ? `tecdoc/search/articles?${params.toString()}` : 'tecdoc/search/articles'
    navigate(newUrl)
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
    <Layout
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <Header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          style={{
            maxWidth: 1200,
            margin: "auto",
            height: 64,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Поиск артикулов
          </Title>

          <Link
            to="/tecdoc"
            className={'header-link'}
          >
            Главная
          </Link>
        </Flex>
      </Header>

      <Content
        style={{
          maxWidth: 1200,
          minHeight: 0,
          margin: '0 auto',
          padding: 24,
        }}
      >
        {/* Search Form */}
        <Card
          title="Поиск артикулов"
          style={{
            marginBottom: 24,
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
              viewMode={'rows'}
            />

            <Pagination
              currentPage={data.page}
              totalPages={data.total}
              onPageChange={handlePageChange}
            />
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
      </Content>
    </Layout>
  )
}
