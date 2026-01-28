import {Typography, Card, Input, Empty, Space} from 'antd';
import type {AttributeDto} from '../../../../api/TecDoc/api/types.ts';
import {PaginatedTable} from '../../paginated-table.tsx';

type Props = {
  filteredAttributes: AttributeDto[]
  attributesSearch: string,
  globalSearch?: string
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

  const attributeColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: 280,
    },
    {
      title: 'Заголовок',
      dataIndex: 'displayTitle',
      key: 'displayTitle',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Значение',
      dataIndex: 'displayValue',
      key: 'displayValue',
      width: 150,
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
  ]

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
            columns={attributeColumns}
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