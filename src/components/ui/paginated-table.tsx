import React, {useState} from 'react'
import {Button, Space, Typography} from 'antd'
import {LeftOutlined, RightOutlined} from '@ant-design/icons'

interface PaginatedTableProps<T> {
  items: T[]
  renderRow: (item: T, index: number) => React.ReactNode
  itemsPerPage?: number
  showAllThreshold?: number
  headers: React.ReactNode
}

export function PaginatedTable<T>({
                                    items,
                                    renderRow,
                                    itemsPerPage = 20,
                                    showAllThreshold = 50,
                                    headers = [],
                                  }: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [showAll, setShowAll] = useState(false)

  if (items.length === 0) {
    return (
      <Typography.Paragraph style={{color: '#6b7280', fontSize: 12}}>
        Элементы не найдены
      </Typography.Paragraph>
    )
  }

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = showAll ? items.length : startIndex + itemsPerPage
  const displayedItems = items.slice(startIndex, endIndex)

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          {headers}
          <tbody>
          {displayedItems.map((item, idx) => {
            const globalIndex = startIndex + idx
            return renderRow(item, globalIndex)
          })}
          </tbody>
        </table>
      </div>

      {items.length > showAllThreshold && !showAll && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Space>
            <Button
              type="default"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{minWidth: 32}}
              icon={<LeftOutlined/>}
            />
            <Typography.Text style={{fontSize: 12, color: '#6b7280'}}>
              Страница {currentPage} из {totalPages} ({startIndex + 1}-{Math.min(endIndex, items.length)} из{' '}
              {items.length})
            </Typography.Text>
            <Button
              type="default"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{minWidth: 32}}
              icon={<RightOutlined/>}
            />
          </Space>

          <Button type="default" size="small" onClick={() => setShowAll(true)}>
            Показать все ({items.length})
          </Button>
        </div>
      )}

      {showAll && (
        <div style={{paddingTop: 16, borderTop: '1px solid #f0f0f0'}}>
          <Button
            type="default"
            size="small"
            onClick={() => {
              setShowAll(false)
              setCurrentPage(1)
            }}
          >
            Свернуть
          </Button>
        </div>
      )}
    </div>
  )
}
