import { Card, Table, Skeleton, Empty } from 'antd'
import {CalendarOutlined, InboxOutlined} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type {ArticleDocument} from '../../../api/TecDoc/api/types.ts';
import type {ViewMode} from '../../../api/TecDoc/utils/view-preferences.ts';
import {formatDate} from '../../../api/TecDoc/utils.ts';



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
    if (viewMode === 'rows') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ))}
        </div>
      )
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    )
  }

  /* ---------------- EMPTY ---------------- */
  if (!articles.length) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Empty
          description="Артикулы не найдены"
        />
      </div>
    )
  }

  /* ---------------- ROWS VIEW ---------------- */
  if (viewMode === 'rows') {
    const columns: ColumnsType<ArticleDocument> = [
      {
        title: 'Номер артикула',
        dataIndex: 'dataSupplierArticleNumber',
        key: 'article',
        render: (value) => (
          <span style={{ fontWeight: 600 }}>{value}</span>
        ),
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
          <div style={{ maxWidth: 400 }}>
            <div style={{ fontWeight: 500 }}>
              {record.normalizedDescription}
            </div>
            {record.description && (
              <div
                style={{
                  fontSize: 12,
                  color: '#888',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {record.description}
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Количество',
        key: 'quantity',
        render: (_, record) =>
          record.quantityPerPackingUnit ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <InboxOutlined />
              {record.quantityPerPackingUnit} шт.
            </span>
          ) : (
            <span style={{ color: '#bbb' }}>—</span>
          ),
      },
      {
        title: 'Дата',
        key: 'date',
        render: (_, record) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined />
            {formatDate(record.indexedAt)}
          </span>
        ),
      },
    ]

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={articles}
        pagination={false}
        onRow={(record) => ({
          onClick: () =>
            navigate(
              `/articles/${record.supplierId}/${record.dataSupplierArticleNumber}`
            ),
          style: { cursor: 'pointer' },
        })}
      />
    )
  }

  /* ---------------- CARDS VIEW ---------------- */
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {articles.map((article) => (
        <Card
          key={article.id}
          hoverable
          onClick={() =>
            navigate(
              `/articles/${article.supplierId}/${article.dataSupplierArticleNumber}`
            )
          }
          style={{
            height: '100%',
            cursor: 'pointer',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {article.dataSupplierArticleNumber}
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              {article.supplierDescription}
            </div>
          </div>

          <div
            style={{
              color: '#555',
              marginBottom: 8,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {article.normalizedDescription}
          </div>

          {article.description && (
            <div
              style={{
                fontSize: 13,
                color: '#777',
                marginBottom: 8,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {article.description}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 12,
              color: '#999',
            }}
          >
            {article.quantityPerPackingUnit && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <InboxOutlined />
                {article.quantityPerPackingUnit} шт.
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined />
              {formatDate(article.indexedAt)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
