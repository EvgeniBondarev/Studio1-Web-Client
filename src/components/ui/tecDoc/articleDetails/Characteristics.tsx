import {Typography, Card, Input, Empty, Space} from 'antd';
import type {AttributeDto} from '../../../../api/TecDoc/api/types.ts';
import {PaginatedTable} from '../../paginated-table.tsx';

type Props = {
  filteredAttributes: AttributeDto[]
  attributesSearch: string,
  globalSearch: string
  attributesLength: number
  setAttributesSearch: (value: string) => void
}

export const Characteristics = ({
                                  filteredAttributes,
                                  attributesLength,
                                  globalSearch,
                                  attributesSearch,
                                  setAttributesSearch
                                }: Props) => {

  const resultCount = filteredAttributes.length;
  const showCountInfo = attributesSearch || globalSearch;

  return (
    <Card
      title={<Typography.Title level={4} style={{margin: 0}}>
        Характеристики ({resultCount}
        {showCountInfo ? ` из ${attributesLength}` : ''})
      </Typography.Title>}
    >

      <Space orientation={'vertical'} size={10} style={{width: '100%'}}>
        <Input
          value={attributesSearch}
          onChange={(e) => setAttributesSearch(e.target.value)}
          placeholder="Поиск по ID, описанию, заголовку, значению..."
          allowClear
        />
        {resultCount > 0 ? (
          <PaginatedTable
            items={filteredAttributes}
            itemsPerPage={20}
            showAllThreshold={30}
            headers={
              <thead>
              <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa'}}>
                {['ID', 'Описание', 'Заголовок', 'Значение',]
                  .map((header, idx) => (
                  <th
                    key={idx}
                    style={{
                      textAlign: 'left',
                      padding: 8,
                      minWidth: 80,
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
            renderRow={(attribute) => (
              <tr
                key={attribute.id}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{padding: 8, fontSize: 12}}>
                  <Typography.Text type="secondary">{attribute.id}</Typography.Text>
                </td>

                <td style={{padding: 8, fontSize: 12}}>
                  {attribute.description}
                </td>

                <td style={{padding: 8, fontSize: 12}}>
                  {attribute.displayTitle || '-'}
                </td>

                <td style={{padding: 8, fontSize: 12}}>
                  <Typography.Text strong>{attribute.displayValue}</Typography.Text>
                </td>
              </tr>
            )}
          />
        ) : attributesSearch || globalSearch ? (
          <Empty description={`По запросу "${attributesSearch || globalSearch}" ничего не найдено`}/>
        ) : (
          <Empty description={"Характеристики не найдены"}/>
        )}
      </Space>
    </Card>
  );
}