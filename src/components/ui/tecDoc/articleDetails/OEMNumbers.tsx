import {Card, Input, Typography, Space, Tag, Empty} from 'antd';
import type {OeNumberDto} from '../../../../api/TecDoc/api/types.ts';
import {PaginatedTable} from '../../paginated-table.tsx';

type Props = {
  filteredOeNumbers: OeNumberDto[]
  oeNumbersSearch: string
  globalSearch: string
  oeNumbersLength: number
  setOeNumbersSearch: (value: string) => void
}

export const OEMNumbers = ({
                             filteredOeNumbers,
                             oeNumbersLength,
                             oeNumbersSearch,
                             globalSearch,
                             setOeNumbersSearch
                           }: Props) => {
  const resultCount = filteredOeNumbers.length;
  const showCountInfo = oeNumbersSearch || globalSearch;

  return (
    <Card
      title={
        <Typography.Title level={4} style={{margin: 0}}>
          {`OEM номера (${resultCount}) ${showCountInfo ? ` из ${oeNumbersLength}` : ''}`}
        </Typography.Title>
      }
    >
      <Space orientation="vertical" size={16} style={{width: '100%'}}>
        <Input
          value={oeNumbersSearch}
          onChange={(e) => setOeNumbersSearch(e.target.value)}
          placeholder="Поиск по OEM номеру..."
          allowClear
        />

        {resultCount > 0 ? (
          <PaginatedTable
            items={filteredOeNumbers}
            itemsPerPage={20}
            showAllThreshold={30}
            headers={
              <thead>
              <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa'}}>
                {['№', 'OEM номер', 'Тип']
                  .map((header, idx) => (
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
            renderRow={(oe, idx) => (
              <tr
                key={idx}
                style={{borderBottom: '1px solid #f3f4f6', cursor: 'default'}}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#fafafa')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <td style={{padding: 8}}>
                  <Typography.Text type="secondary" style={{fontSize: 12}}>
                    {idx + 1}
                  </Typography.Text>
                </td>

                <td style={{padding: 8}}>
                  <Typography.Text code>
                    {oe.oeNbr || oe.oENbr || '—'}
                  </Typography.Text>
                </td>

                <td style={{padding: 8}}>
                  {oe.isAdditive ? (
                    <Tag
                      color="blue"
                      style={{
                        fontSize: 12,
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                      }}
                    >
                      Добавка
                    </Tag>
                  ) : (
                    <Tag
                      color="green"
                      style={{
                        fontSize: 12,
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                      }}
                    >
                      Основной номер
                    </Tag>
                  )}
                </td>
              </tr>
            )}
          />
        ) : oeNumbersSearch || globalSearch ? (
          <Empty description={`По запросу "${oeNumbersSearch || globalSearch}" ничего не найдено`}/>
        ) : (
          <Empty description={'OEM номера не найдены'}/>
        )}
      </Space>

    </Card>
  )
}