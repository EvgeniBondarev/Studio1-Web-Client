import {Pagination, Typography} from 'antd'
import type {LinkageDto} from '../../api/TecDoc/api/types'
import {ExpandableLinkageRow} from './expandable-linkage-row.tsx';
import {useMemo, useState} from 'react';

const {Text} = Typography

const HEADERS = [
  '№',
  'Тип',
  'ID',
  'Транспортное средство',
  'Производитель / Модель',
  'Период',
  'Характеристики',
]

export function LinkageTable({items}: { items: LinkageDto[] }) {

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const PAGE_SIZE = 20

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, page])

  if (!items.length) {
    return (
      <Text type="secondary">
        Применимость не найдена
      </Text>
    )
  }

  return (
    <>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead style={{backgroundColor: '#fafafa'}}>
        <tr style={{borderBottom: '1px solid #f0f0f0'}}>
          {HEADERS.map((header) => (
            <th
              key={header}
              style={{textAlign: 'left', padding: 8}}
            >
              <Text style={{fontSize: 12}}>
                {header}
              </Text>
            </th>
          ))}
        </tr>
        </thead>

        <tbody>
        {pagedItems.map((linkage, idx) => (
          <ExpandableLinkageRow
            key={linkage.linkageId}
            linkage={linkage}
            index={(page - 1) * PAGE_SIZE + idx + 1}
          />
        ))}
        </tbody>
      </table>
      {items.length > PAGE_SIZE && (
        <Pagination
          current={page}
          pageSize={pageSize}
          total={items.length}
          onChange={(newPage, newPageSize) => {
            setPage(newPage)
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize)
              setPage(1)
            }
          }}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          locale={{
            items_per_page: '/ стр',
          }}
          showTotal={(total, range) =>
            `${range[0]}–${range[1]} из ${total}`
          }
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'center',
          }}
        />
      )}
    </>
  )
}