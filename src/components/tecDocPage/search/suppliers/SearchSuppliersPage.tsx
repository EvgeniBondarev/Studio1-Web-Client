import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {Card, Row, Col, Alert, Layout, Typography, Space, Flex} from 'antd'
import {SearchOutlined, WarningOutlined} from '@ant-design/icons'
// import { SupplierSearchForm } from '@/components/search/supplier-search-form'
// import { SupplierList } from '@/components/search/supplier-list'
import type {SupplierSearchRequest, SupplierSearchResult} from '../../../../api/TecDoc/api/types.ts';
import type {ApiError} from '../../../../api/TecDoc/api/client.ts';
import {supplierSearchService} from '../../../../api/TecDoc/api/services/supplier-search.service.ts';
import {getViewMode, setViewMode, type ViewMode} from '../../../../api/TecDoc/utils/view-preferences.ts';
import {Link} from 'react-router-dom';
import {ViewToggle} from '../../../ui/view-toggle.tsx';
import {Pagination} from '../../../ui/Pagination.tsx';
import {SupplierSearchForm} from './SupplierSearchForm.tsx';
import {SupplierList} from '../../../ui/tecDoc/SupplierList.tsx';


const { Header, Content } = Layout
const { Title, Text } = Typography

export const SearchSuppliersPage=()=> {
  const [searchRequest, setSearchRequest] = useState<SupplierSearchRequest>({
    query: null,
    page: 1,
    pageSize: 20,
    sortBy: 'description',
    sortDescending: false,
  })

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return getViewMode()
    }
    return 'cards'
  })

  const {
    data,
    isLoading,
    error,
  } = useQuery<SupplierSearchResult, ApiError>({
    queryKey: ['supplierSearch', searchRequest],
    queryFn: () => supplierSearchService.search(searchRequest),
    enabled: true, // Всегда включен для автоматической загрузки
    staleTime: 5 * 60 * 1000, // 5 минут
  })

  const handleSearch = (request: SupplierSearchRequest) => {
    setSearchRequest({
      ...request,
      query: request.query?.trim() || null,
      page: 1
    })
  }

  const handlePageChange = (page: number) => {
    setSearchRequest({ ...searchRequest, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cardStyle = {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '24px'
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
            Поиск поставщиков
          </Title>

          <Link
            to="/tecdoc"
            className={'header-link'}
          >
            Главная
          </Link>
        </Flex>
      </Header>

      <Content style={{
        width:'900px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        {/* Search Form */}
        <Card
          title="Поиск поставщиков"
          style={cardStyle}
        >

          <SupplierSearchForm
            onSubmit={handleSearch}
            isLoading={isLoading}
            initialQuery={searchRequest.query || ''}
          />
          {!searchRequest.query && (
            <Text
              type="secondary"
              style={{
                display: 'block',
                marginTop: '12px',
                fontSize: '14px'
              }}
            >
              Показаны все поставщики. Введите запрос для фильтрации.
            </Text>
          )}
        </Card>

        {/* Error Display */}
        {error && (
          <Alert
            message="Ошибка"
            description={
              <div>
                <div style={{ fontWeight: 600 }}>{error.code}</div>
                <div>{error.message}</div>
              </div>
            }
            type="error"
            showIcon
            icon={<WarningOutlined />}
            style={{
              marginBottom: '24px',
              borderRadius: '8px'
            }}
          />
        )}

        {/* Results */}
        {data && (
          <>
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: '16px' }}
            >
              <Col>
                <Space>
                  <Text type="secondary">
                    Найдено:{' '}
                    <Text strong style={{ color: '#000' }}>
                      {data.total}
                    </Text>{' '}
                    поставщиков
                  </Text>
                  {data.took && (
                    <Text type="secondary" style={{fontSize: '14px'}}>
                      (за {data.took} мс)
                    </Text>
                  )}
                </Space>
              </Col>
              <Col>
                <ViewToggle
                  value={viewMode}
                  onChange={(mode) => {
                    setViewModeState(mode)
                    setViewMode(mode)
                  }}
                />
              </Col>
            </Row>

            <SupplierList
              suppliers={data.items}
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

        {/* Empty State */}
        {!data && !isLoading && !error && (
          <Card style={{ textAlign: 'center', ...cardStyle }}>
            <div style={{ padding: '48px 24px' }}>
              <SearchOutlined style={{
                fontSize: '48px',
                color: '#d9d9d9',
                marginBottom: '16px'
              }} />
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Поставщики не найдены
              </Text>
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  )
}