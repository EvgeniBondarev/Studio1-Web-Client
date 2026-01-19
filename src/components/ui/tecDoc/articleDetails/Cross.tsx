import {Card, Input, Typography} from 'antd';
import {PaginatedTable} from '../../paginated-table.tsx';
import type {CrossDto} from '../../../../api/TecDoc/api/types.ts';

type Props={
  filteredCrosses:  CrossDto[],
  crossesSearch: string,
  globalSearch:string,
  crossesLength: number,
  setCrossesSearch:(search: string) => void,
}

export const Cross = ({crossesLength,
                      filteredCrosses,
                      crossesSearch,globalSearch,
                      setCrossesSearch}:Props)=>{
  return (
    <Card style={{marginBottom: 24,}}>
      <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
        <Typography.Title
          level={4}
          style={{margin: 0}}
        >
          Аналоги (кроссы) ({filteredCrosses.length}
          {crossesSearch || globalSearch ? ` из ${crossesLength}` : ''})
        </Typography.Title>
      </div>

      <div
        style={{
          padding: 24,
        }}
      >
        <div style={{marginBottom: 16}}>
          <Input
            value={crossesSearch}
            onChange={(e) => setCrossesSearch(e.target.value)}
            placeholder="Поиск по номеру артикула, производителю..."
            allowClear
          />
        </div>

        {filteredCrosses.length > 0 ? (
          <PaginatedTable
            items={filteredCrosses}
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
                  Номер артикула
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: 12,
                }}>
                  Производитель
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontWeight: 600,
                  color: '#4b5563',
                  fontSize: 12,
                }}>
                  ID производителя
                </th>
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
                  {cross.oeNbr || cross.oENbr || '—'}
                </td>

                <td style={{padding: '12px 16px', fontSize: 12,}}>
                  {cross.manufacturer ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontWeight: 500,
                      }}
                    >
                  {cross.manufacturer.description}
                </span>
                  ) : (
                    <span style={{color: '#9ca3af'}}>—</span>
                  )}
                </td>

                <td style={{padding: '12px 16px', fontSize: 12, color: '#6b7280',}}>
                  {cross.manufacturerId}
                </td>
              </tr>
            )}
          />
        ) : (
          <p style={{color: '#6b7280', fontSize: 12,}}>
            Кроссы не найдены
          </p>
        )}
      </div>
    </Card>
  )
}