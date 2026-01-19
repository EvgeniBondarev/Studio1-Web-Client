import {Card, Input, Typography} from 'antd';
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
  return (
    <Card style={{marginBottom: 24,}}>
      <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
        <Typography.Title level={4} style={{margin: 0}}>
          OEM номера ({filteredOeNumbers.length}
          {oeNumbersSearch || globalSearch ? ` из ${oeNumbersLength}` : ''})
        </Typography.Title>
      </div>

      <div style={{padding: 24,}}>
        <div style={{marginBottom: 16}}>
          <Input
            value={oeNumbersSearch}
            onChange={(e) => setOeNumbersSearch(e.target.value)}
            placeholder="Поиск по OEM номеру..."
            allowClear
          />
        </div>

        {filteredOeNumbers.length > 0 ? (
          <PaginatedTable
            items={filteredOeNumbers}
            itemsPerPage={20}
            showAllThreshold={30}
            headers={
              <thead>
              <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa',}}>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: 12,
                }}>
                  №
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: 12,
                }}>
                  OEM номер
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: 12,
                }}>
                  Тип
                </th>
              </tr>
              </thead>
            }
            renderRow={(oe, idx) => (
              <tr
                key={idx}
                style={{borderBottom: '1px solid #f3f4f6', cursor: 'default',}}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#fafafa')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <td style={{padding: '12px 16px', fontSize: 12, color: '#6b7280',}}>
                  {idx + 1}
                </td>

                <td style={{
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#111827',
                  fontFamily: 'monospace',
                }}>
                  {oe.oeNbr || oe.oENbr || '—'}
                </td>

                <td style={{padding: '12px 16px', fontSize: 12,}}>
                  {oe.isAdditive ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                  Добавка
                </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                  Основной номер
                </span>
                  )}
                </td>
              </tr>
            )}
          />
        ) : oeNumbersSearch || globalSearch ? (
          <p style={{color: '#6b7280', fontSize: 12, textAlign: 'center', padding: '32px 0',}}>
            По запросу &quot;{oeNumbersSearch || globalSearch}&quot; ничего не найдено
          </p>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12,}}>
            OEM номера не найдены
          </p>
        )}
      </div>
    </Card>
  )
}