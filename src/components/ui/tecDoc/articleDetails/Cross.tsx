import {Card, Input, Typography, Space, Tag, Empty} from 'antd';
import {PaginatedTable} from '../../paginated-table.tsx';
import type {CrossDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  filteredCrosses: CrossDto[],
  crossesSearch: string,
  globalSearch: string,
  crossesLength: number,
  setCrossesSearch: (search: string) => void,
}

export const Cross = ({
                        crossesLength,
                        filteredCrosses,
                        crossesSearch,
                        globalSearch,
                        setCrossesSearch
                      }: Props) => {

  const showCount = crossesSearch || globalSearch;
  const resultCount = filteredCrosses.length;

  return (
    <Card
      title={<Typography.Title level={4}>
        Аналоги (кроссы) {resultCount}{showCount ? ` из ${crossesLength}` : ''}
      </Typography.Title>}
    >

      <div>
        <Space orientation="vertical" size={16} style={{width: '100%'}}>
          <Input
            value={crossesSearch}
            onChange={(e) => setCrossesSearch(e.target.value)}
            placeholder="Поиск по номеру артикула, производителю..."
            allowClear
          />

          {resultCount > 0 ? (
            <PaginatedTable
              items={filteredCrosses}
              itemsPerPage={20}
              showAllThreshold={30}
              headers={
                <thead>
                <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa'}}>
                  {[
                    '№',
                    'Номер артикула',
                    'Производитель',
                    'ID производителя',
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      style={{
                        textAlign: 'left',
                        padding: 8,
                      }}
                    >
                      <Typography.Text type="secondary" style={{fontSize: 12}}>
                        {header}
                      </Typography.Text>
                    </th>
                  ))}
                </tr>
                </thead>
              }
              renderRow={(cross, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#fafafa')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <td style={{padding: '12px 16px', fontSize: 12}}>
                    <Typography.Text type="secondary">
                      {idx + 1}
                    </Typography.Text>
                  </td>

                  <td style={{padding: '12px 16px', fontSize: 12}}>
                    <Typography.Text
                      strong
                      style={{
                        fontSize: 12
                      }}
                    >
                      {cross.oeNbr || cross.oENbr || '—'}
                    </Typography.Text>
                  </td>

                  <td style={{padding: '12px 16px', fontSize: 12}}>
                    {cross.manufacturer ? (
                      <Tag
                        color="blue"
                        style={{
                          fontWeight: 500,
                          fontSize: 12,
                          borderRadius: 4,
                        }}
                      >
                        {cross.manufacturer.description}
                      </Tag>
                    ) : (
                      <Typography.Text type="secondary">—</Typography.Text>
                    )}
                  </td>

                  <td style={{padding: 12, fontSize: 12}}>
                    <Typography.Text type="secondary">
                      {cross.manufacturerId}
                    </Typography.Text>
                  </td>
                </tr>
              )}
            />
          ) : (
            <Empty description={"Кроссы не найдены"}/>
          )}
        </Space>
      </div>
    </Card>
  )
}