import {Card, Table, Skeleton, Empty, Flex, Space, Typography, Row, Col} from 'antd'
import {CalendarOutlined, InboxOutlined} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type {ArticleDocument} from '../../../api/TecDoc/api/types.ts';
import type {ViewMode} from '../../../api/TecDoc/utils/view-preferences.ts';
import {formatDate} from '../../../api/TecDoc/utils.ts';
import {ROUTE_GENERATE_TEC_DOC} from '../../tecDocPage/constants/routes.ts';

const {Text, Paragraph}=Typography;

interface ArticleListProps {
  articles: ArticleDocument[]
  isLoading?: boolean
  viewMode?: ViewMode
}

export function ArticleList({
                              articles,
                              isLoading,
                              viewMode = 'cards',
                            }: ArticleListProps) {
  const navigate = useNavigate()

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <Space orientation="vertical" size={8} style={{ width: '100%' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </Space>
    )
  }

  /* ---------------- EMPTY ---------------- */
  if (!articles.length) {
    return (
      <Flex justify="center" align="center">
        <Empty description="Артикулы не найдены" />
      </Flex>
    )
  }

  /* ---------------- ROWS VIEW ---------------- */
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* ---------------- ROWS VIEW ---------------- */}
      {viewMode === 'rows' && (() => {
        const columns: ColumnsType<ArticleDocument> = [
          {
            title: 'Номер артикула',
            dataIndex: 'dataSupplierArticleNumber',
            key: 'article',
            render: (value) => <Text strong>{value}</Text>,
          },
          {
            title: 'Поставщик',
            dataIndex: 'supplierDescription',
            key: 'supplier',
          },
          {
            title: 'Описание',
            key: 'description',
            render: (_, record) => (
              <Flex vertical style={{ maxWidth: 400 }}>
                <Text strong>{record.normalizedDescription}</Text>
                {record.description && (
                  <Text
                    type="secondary"
                    ellipsis
                    style={{ fontSize: 12 }}
                  >
                    {record.description}
                  </Text>
                )}
              </Flex>
            ),
          },
          {
            title: 'Количество',
            key: 'quantity',
            render: (_, record) =>
              record.quantityPerPackingUnit ? (
                <Space size={6}>
                  <InboxOutlined />
                  {record.quantityPerPackingUnit} шт.
                </Space>
              ) : (
                <Text type="secondary">—</Text>
              ),
          },
          {
            title: 'Дата',
            key: 'date',
            render: (_, record) => (
              <Space size={6}>
                <CalendarOutlined />
                {formatDate(record.indexedAt)}
              </Space>
            ),
          },
        ]

        return (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={articles}
            pagination={false}
            tableLayout={'fixed'}
            onRow={(record) => ({
              onClick: () =>
                navigate(
                  ROUTE_GENERATE_TEC_DOC.articleDetail(
                    record.supplierId,
                    record.dataSupplierArticleNumber
                  )
                ),
              style: { cursor: 'pointer',  width: '100%' },
            })}
          />
        )
      })()}

      {/* ---------------- CARDS VIEW ---------------- */}
      {viewMode === 'cards' && (
        <Row gutter={[16, 16]}>
          {articles.map((article) => (
            <Col key={article.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() =>
                  navigate(
                    ROUTE_GENERATE_TEC_DOC.articleDetail(
                      article.supplierId,
                      article.dataSupplierArticleNumber
                    )
                  )
                }
                style={{ height: '100%', cursor: 'pointer' }}
              >
                <Space orientation="vertical" size={4} style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {article.dataSupplierArticleNumber}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {article.supplierDescription}
                  </Text>
                </Space>

                <Paragraph style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                  {article.normalizedDescription}
                </Paragraph>

                {article.description && (
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, marginBottom: 8 }}
                    ellipsis
                  >
                    {article.description}
                  </Text>
                )}

                <Space size={16} style={{ fontSize: 12 }}>
                  {article.quantityPerPackingUnit && (
                    <Space size={6}>
                      <InboxOutlined />
                      {article.quantityPerPackingUnit} шт.
                    </Space>
                  )}

                  <Space size={6}>
                    <CalendarOutlined />
                    {formatDate(article.indexedAt)}
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
