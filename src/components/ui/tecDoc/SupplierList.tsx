import {useNavigate} from 'react-router-dom'
import {Card, Table, Empty, Row, Col, Tag, Space, Skeleton, Flex, Typography} from 'antd'
import {CalendarOutlined} from '@ant-design/icons'
import type {SupplierDocument} from '../../../api/TecDoc/api/types.ts';
import {formatDate} from '../../../api/TecDoc/utils.ts';
import {ROUTE_GENERATE_TEC_DOC} from '../../tecDocPage/constants/routes.ts';

const {Text, Title} = Typography

interface Props {
  suppliers: SupplierDocument[]
  isLoading?: boolean
  viewMode?: 'cards' | 'rows'
}

export const SupplierList = ({suppliers, isLoading, viewMode = 'cards'}: Props) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Space orientation="vertical" size={8} style={{width: '100%'}}>
        {Array.from({length: 6}).map((_, i) => (
          <Card key={i}>
            <Skeleton active paragraph={{rows: 1}}/>
          </Card>
        ))}
      </Space>
    )
  }

  if (!suppliers.length) {
    return (
      <Flex justify="center" align="center">
        <Empty description="Поставщики не найдены"/>
      </Flex>
    )
  }

  /* ---------------- ROWS VIEW ---------------- */
  if (viewMode === 'rows') {
    const columns = [
      {
        title: 'Название',
        dataIndex: 'description',
        key: 'description',
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: 'Код',
        dataIndex: 'matchcode',
        key: 'matchcode',
        render: (text: string) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: 'Артикулов',
        dataIndex: 'nbrOfArticles',
        key: 'nbrOfArticles',
        render: (value?: number) => value ? (
          <Space size={6}>
            {value.toLocaleString()}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
      },
      {
        title: 'Версия данных',
        dataIndex: 'dataVersion',
        key: 'dataVersion',
        render: (value: string) => value ? (
          <Text>{value}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
      },
      {
        title: 'Дата',
        dataIndex: 'indexedAt',
        key: 'indexedAt',
        render: (date: string) => (
          <Space size={6}>
            <CalendarOutlined />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatDate(date)}
            </Typography.Text>
          </Space>
        ),
      },
    ]

    const dataSource = suppliers.map(supplier => ({
      key: supplier.id,
      ...supplier,
      onClick: () => navigate(
        ROUTE_GENERATE_TEC_DOC.supplierDetail(
          supplier.supplierId
        )),
    }))

    return (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          onRow={(record) => ({
            onClick: record.onClick,
            style: { cursor: 'pointer' },
          })}
        />
    )
  }

  {/* ---------------- CARDS VIEW ---------------- */}
  return (
    <Row gutter={[16, 16]}>
      {suppliers.map((supplier) => (
        <Col xs={24} sm={12} md={8} lg={6} key={supplier.id}>
          <Card
            hoverable
            onClick={() =>
              navigate(
                ROUTE_GENERATE_TEC_DOC.supplierDetail(supplier.supplierId)
              )
            }
            style={{ height: '100%', cursor: 'pointer' }}
          >
            <Flex vertical style={{ height: '100%' }}>
              <Space orientation="vertical" size={4}>
                <Title
                  level={5}
                  style={{ margin: 0, color: '#000' }}
                >
                  {supplier.description}
                </Title>

                <Space size="small">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Код:
                  </Text>
                  <Tag color="blue" style={{ margin: 0 }}>
                    {supplier.matchcode}
                  </Tag>
                </Space>
              </Space>

              <Space
                orientation="vertical"
                size="small"
                style={{ marginTop: 'auto' }}
              >
                {supplier.nbrOfArticles !== undefined && (
                  <Space size="small">
                    <Text>
                      Артикулов:{' '}
                      <Text strong>
                        {supplier.nbrOfArticles.toLocaleString()}
                      </Text>
                    </Text>
                  </Space>
                )}

                {supplier.dataVersion && (
                  <Text type="secondary">
                    Версия данных: {supplier.dataVersion}
                  </Text>
                )}

                <Space size="small">
                  <CalendarOutlined />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(supplier.indexedAt)}
                  </Text>
                </Space>
              </Space>
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  )
}