import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {Card, Row, Col, Alert, Typography, Space, Flex, Pagination} from 'antd'
import {SearchOutlined, WarningOutlined} from '@ant-design/icons'
import type {SupplierSearchRequest, SupplierSearchResult} from '../../../../api/TecDoc/api/types.ts';
import type {ApiError} from '../../../../api/TecDoc/api/client.ts';
import {supplierSearchService} from '../../../../api/TecDoc/api/services/supplier-search.service.ts';
import {getViewMode, setViewMode, type ViewMode} from '../../../../api/TecDoc/utils/view-preferences.ts';
import {Link} from 'react-router-dom';
import {ViewToggle} from '../../../ui/view-toggle.tsx';
import {SupplierSearchForm} from './SupplierSearchForm.tsx';
import {SupplierList} from '../../../ui/tecDoc/SupplierList.tsx';
import {PageLayout} from '../../../ui/tecDoc/PageLayout.tsx';
import {PageHeader} from '../../../ui/tecDoc/PageHeader.tsx';
import {ROUTE_TEC_DOC} from '../../constants/routes.ts';

const { Text } = Typography

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
    <PageLayout
      header={
        <PageHeader
          title="Поиск поставщиков"
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
              {data.total > 20 && (
                <Pagination current={data.page}
                            total={data.total}
                            pageSize={20}
                            onChange={(page) => handlePageChange(page)}
                            showSizeChanger={false}
                            style={{marginTop: 24}}
                />)}
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
    </PageLayout>
  )
}