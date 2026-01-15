import { useNavigate } from 'react-router-dom'
import {Card, Table, Empty, Row, Col, Tag, Space, Skeleton} from 'antd'
import {BuildOutlined, PauseOutlined, CalendarOutlined} from '@ant-design/icons'
import type {SupplierDocument} from '../../../api/TecDoc/api/types.ts';
import {formatDate} from '../../../api/TecDoc/utils.ts';


interface Props {
  suppliers: SupplierDocument[]
  isLoading?: boolean
  viewMode?: 'cards' | 'rows'
}

export const SupplierList=({ suppliers, isLoading, viewMode = 'cards' }: Props)=> {
  const navigate = useNavigate()

  if (isLoading) {
    if (viewMode === 'rows') {
      return (
        <div style={{
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      )
    }

    return (
      <Row gutter={[16, 16]}>
        {[...Array(6)].map((_, i) => (
          <Col xs={24} sm={12} lg={8} key={i}>
            <Card style={{ height: '100%' }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: '#fff',
        borderRadius: '8px'
      }}>
        <Empty
          image={<BuildOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
          description="Поставщики не найдены"
        />
      </div>
    )
  }

  if (viewMode === 'rows') {
    const columns = [
      {
        title: 'Название',
        dataIndex: 'description',
        key: 'description',
        render: (text: string) => (
          <span style={{ fontWeight: 500, color: '#000' }}>{text}</span>
        ),
      },
      {
        title: 'Код',
        dataIndex: 'matchcode',
        key: 'matchcode',
        width: 120,
        render: (text: string) => (
          <Tag color="blue" style={{ margin: 0 }}>{text}</Tag>
        ),
      },
      {
        title: 'Артикулов',
        dataIndex: 'nbrOfArticles',
        key: 'nbrOfArticles',
        width: 120,
        render: (nbrOfArticles: number | undefined) => (
          <Space size="small" style={{ color: nbrOfArticles ? '#000' : '#bfbfbf' }}>
            <PauseOutlined />
            {nbrOfArticles ? nbrOfArticles.toLocaleString() : '—'}
          </Space>
        ),
      },
      {
        title: 'Версия данных',
        dataIndex: 'dataVersion',
        key: 'dataVersion',
        width: 140,
        render: (dataVersion: string) => (
          <span style={{ color: dataVersion ? '#000' : '#bfbfbf' }}>
            {dataVersion || '—'}
          </span>
        ),
      },
      {
        title: 'Дата',
        dataIndex: 'indexedAt',
        key: 'indexedAt',
        width: 120,
        render: (date: string) => (
          <Space size="small" style={{ color: '#666', fontSize: '12px' }}>
            <CalendarOutlined />
            {formatDate(date)}
          </Space>
        ),
      },
    ]

    const dataSource = suppliers.map(supplier => ({
      key: supplier.id,
      ...supplier,
      onClick: () => navigate(`/suppliers/${supplier.supplierId}`),
    }))

    return (
      <div style={{
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="middle"
          onRow={(record) => ({
            onClick: record.onClick,
            style: {
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5'
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = ''
            }
          })}
          style={{ border: 'none' }}
        />
      </div>
    )
  }

  // Карточный вид
  return (
    <Row gutter={[16, 16]}>
      {suppliers.map((supplier) => (
        <Col xs={24} sm={12} lg={8} key={supplier.id}>
          <Card
            hoverable
            onClick={() => navigate(`/suppliers/${supplier.supplierId}`)}
            style={{
              height: '100%',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            bodyStyle={{
              padding: '16px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{
                margin: 0,
                marginBottom: '4px',
                fontSize: '16px',
                fontWeight: 500,
                color: '#000'
              }}>
                {supplier.description}
              </h4>
              <Space size="small" style={{ color: '#666', fontSize: '12px' }}>
                Код: <Tag color="blue" style={{ margin: 0 }}>{supplier.matchcode}</Tag>
              </Space>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {supplier.nbrOfArticles !== undefined && (
                  <Space size="small" style={{ color: '#666', fontSize: '14px' }}>
                    <PauseOutlined />
                    <span>
                      Артикулов:{' '}
                      <span style={{ fontWeight: 500, color: '#000' }}>
                        {supplier.nbrOfArticles.toLocaleString()}
                      </span>
                    </span>
                  </Space>
                )}

                {supplier.dataVersion && (
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Версия данных: {supplier.dataVersion}
                  </div>
                )}

                <Space size="small" style={{ color: '#999', fontSize: '12px' }}>
                  <CalendarOutlined />
                  {formatDate(supplier.indexedAt)}
                </Space>
              </Space>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )
}