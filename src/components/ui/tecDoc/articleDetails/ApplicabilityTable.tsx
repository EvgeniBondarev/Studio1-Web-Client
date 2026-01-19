import {LinkOutlined} from '@ant-design/icons';
import {Card, Input, Typography} from 'antd';
import {PaginatedTable} from '../../paginated-table.tsx';
import {ExpandableLinkageRow} from '../../expandable-linkage-row.tsx';
import type {LinkageDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  linkagesLength: number
  filteredLinkages: LinkageDto[]
  linkagesSearch: string
  globalSearch: string
  setLinkagesSearch: (value: string) => void
  getLinkageTypeLabel: any
}

export const ApplicabilityTable = ({
                                     linkagesLength,
                                     filteredLinkages,
                                     globalSearch,
                                     linkagesSearch,
                                     setLinkagesSearch,
                                     getLinkageTypeLabel
                                   }: Props) => {
  return (
    <Card id="linkages-table" style={{marginBottom: 24}}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <LinkOutlined style={{width: 20, height: 20}}/>
        <Typography.Title level={4} style={{margin: 0}}>
          Применимость ({filteredLinkages.length}
          {linkagesSearch || globalSearch ? ` из ${linkagesLength}` : ''})
        </Typography.Title>
      </div>
      
      <div style={{padding: 24}}>
        <div style={{marginBottom: 16}}>
          <Input
            value={linkagesSearch}
            onChange={(e) => setLinkagesSearch(e.target.value)}
            placeholder="Поиск по типу, ID, транспортному средству, модели, производителю, характеристикам..."
            allowClear
          />
        </div>

        {filteredLinkages.length > 0 ? (
          <PaginatedTable
            items={filteredLinkages}
            itemsPerPage={20}
            showAllThreshold={50}
            headers={
              <thead>
              <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa',}}>
                {[
                  '№',
                  'Тип',
                  'ID',
                  'Транспортное средство',
                  'Производитель / Модель',
                  'Период',
                  'Характеристики',
                ].map((header, idx) => (
                  <th
                    key={idx}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontWeight: 600,
                      color: '#4b5563',
                      fontSize: 12,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
              </thead>
            }
            renderRow={(linkage, idx) => (
              <ExpandableLinkageRow
                key={`linkage-${idx}`}
                linkage={linkage}
                index={idx}
                getLinkageTypeLabel={getLinkageTypeLabel}
              />
            )}
          />
        ) : linkagesSearch || globalSearch ? (
          <p style={{color: '#6b7280', fontSize: 12, textAlign: 'center', padding: '32px 0',}}>
            По запросу &quot;{linkagesSearch || globalSearch}&quot; ничего не найдено
          </p>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12}}>
            Применимость не найдена
          </p>
        )}
      </div>
    </Card>
  )
}