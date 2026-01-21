import {LinkOutlined} from '@ant-design/icons';
import {Card, Empty, Input, Space, Typography} from 'antd';
import {PaginatedTable} from '../../paginated-table.tsx';
import {ExpandableLinkageRow} from '../../expandable-linkage-row.tsx';
import type {LinkageDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  linkagesLength: number
  filteredLinkages: LinkageDto[]
  linkagesSearch: string
  globalSearch: string
  setLinkagesSearch: (value: string) => void
}

export const ApplicabilityTable = ({
                                     linkagesLength,
                                     filteredLinkages,
                                     globalSearch,
                                     linkagesSearch,
                                     setLinkagesSearch,
                                   }: Props) => {
  return (
    <Card id="linkages-table" style={{marginBottom: 24}}
          title={<Space align="center" size={8} style={{width: '100%'}}>
            <LinkOutlined style={{width: 20, height: 20}}/>
            <Typography.Title level={4} style={{margin: 0, flex: 1}}>
              Применимость ({filteredLinkages.length}
              {linkagesSearch || globalSearch ? ` из ${linkagesLength}` : ''})
            </Typography.Title>
          </Space>}
    >

      <Space orientation="vertical" size={16} style={{width: '100%'}}>
        <Input
          value={linkagesSearch}
          onChange={(e) => setLinkagesSearch(e.target.value)}
          placeholder="Поиск по типу, ID, транспортному средству, модели, производителю, характеристикам..."
          allowClear
        />

        {filteredLinkages.length > 0 ? (
          <PaginatedTable
            items={filteredLinkages}
            itemsPerPage={20}
            showAllThreshold={50}
            headers={
              <thead>
              <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa'}}>
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
            renderRow={(linkage, idx) => (
              <ExpandableLinkageRow
                key={`linkage-${idx}`}
                linkage={linkage}
                index={idx}
              />
            )}
          />
        ) : linkagesSearch || globalSearch ? (
          <Empty description={`По запросу ${linkagesSearch || globalSearch} ничего не найдено`}/>
        ) : (
          <Empty description={'Применимость не найдена'}/>
        )}
      </Space>
    </Card>
  )
}