import {Link, useParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Card, Spin, Alert, Layout, Typography, Flex, Space} from 'antd'
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import {type SupplierDetailResponse, supplierService} from '../../../../api/TecDoc/api/services/supplier.service.ts'
import type {ApiError} from '../../../../api/TecDoc/api/client.ts'
import '../../tecDoc.css'
import {SupplierDetailsCard} from '../../../ui/tecDoc/supplierDetails/SupplierDetailsCard.tsx'
import {ROUTE_TEC_DOC} from '../../constants/routes.ts';

const {Header, Content} = Layout
const {Text} = Typography

export const SupplierDetailPage = () => {
  const {supplierId} = useParams()
  const supplierIdNum = parseInt(supplierId as string)

  const {data, isLoading, error} = useQuery<SupplierDetailResponse, ApiError>({
    queryKey: ['supplier', supplierIdNum],
    queryFn: () => supplierService.getById(supplierIdNum),
    enabled: !!supplierId && !isNaN(supplierIdNum),
    staleTime: 30 * 60 * 1000, // 30 минут
  })

  const supplier = data?.supplier
  const details = data?.details || []

  // ===== LOADING =====
  if (isLoading) {
    return (
      <Layout style={{minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
        <Content>
          <Flex
            justify="center"
            align="center"
            style={{height: '100vh'}}
          >
            <Spin size="large"/>
          </Flex>
        </Content>
      </Layout>
    )
  }

  // ===== ERROR =====
  if (error) {
    return (
      <Layout style={{minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
        <Content style={{padding: 24}}>
          <Card
            bordered
            style={{
              maxWidth: 600,
              margin: '0 auto',
              borderColor: '#ffa39e',
              backgroundColor: '#fff1f0',
            }}
          >
            <Alert
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined/>}
              message={`Ошибка: ${error.code}`}
              description={error.message}
            />
          </Card>
        </Content>
      </Layout>
    )
  }

  // ===== NOT FOUND =====
  if (!supplier) {
    return (
      <Layout style={{minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
        <Content style={{padding: 24}}>
          <Card
            bordered
            style={{
              maxWidth: 600,
              margin: '0 auto',
              borderColor: '#ffe58f',
              backgroundColor: '#fffbe6',
            }}
          >
            <Alert
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined/>}
              message="Поставщик не найден"
              description={
                <Space orientation="vertical" size={0}>
                  <Text>Поставщик с ID {supplierId} не найден в системе.</Text>
                  <Link to={ROUTE_TEC_DOC.SEARCH_SUPPLIERS}>
                    Вернуться к поиску поставщиков
                  </Link>
                </Space>
              }
            />
          </Card>
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{minHeight: '100vh', backgroundColor: '#f9fafb'}}>
      <Header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: `1px solid #e5e7eb`,
          height: 'auto',
        }}
      >
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
        }}>
          <Flex align="center">
            <Link to={ROUTE_TEC_DOC.SEARCH_SUPPLIERS} className="header-link">
              <Space size={6}>
                <ArrowLeftOutlined/>
                <span>Назад к поиску поставщиков</span>
              </Space>
            </Link>
          </Flex>
        </div>
      </Header>

      <Content style={{padding: `32px 24px 48px`, overflow: 'auto'}}>
        <div style={{maxWidth: 896, margin: '0 auto'}}>
          <SupplierDetailsCard
            supplier={supplier}
            details={details}
          />
        </div>
      </Content>
    </Layout>
  )
}