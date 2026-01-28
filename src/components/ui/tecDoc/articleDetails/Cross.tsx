import {Card, Input, Typography, Space, Tag, Empty} from 'antd';
import {PaginatedTable} from '../../paginated-table.tsx';
import type {CrossDto} from '../../../../api/TecDoc/api/types.ts';

const {Text, Title}=Typography;

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

  const crossColumns = [
    {
      title: '№',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => {
        return (
          <Text type="secondary">
            {index + 1}
          </Text>
        );
      },
    },
    {
      title: 'Номер артикула',
      key: 'articleNumber',
      width: 200,
      render: (record: CrossDto) => (
        <Text
          strong
        >
          {record.oeNbr || record.oENbr || '—'}
        </Text>
      ),
    },
    {
      title: 'Производитель',
      key: 'manufacturer',
      width: 200,
      render: (record: CrossDto) =>
        record.manufacturer ? (
          <Tag
            color="blue"
            style={{
              fontWeight: 500,
              borderRadius: 4,
              margin: 3,
            }}
          >
            {record.manufacturer.description}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'ID производителя',
      key: 'manufacturerId',
      width: 120,
      render: (record: CrossDto) => (
        <Text type="secondary">
          {record.manufacturerId}
        </Text>
      ),
    },
  ]

  return (
    <Card
      title={<Title level={4}>
        Аналоги (кроссы) {resultCount}{showCount ? ` из ${crossesLength}` : ''}
      </Title>}
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
              columns={crossColumns}
            />
          ) : (
            <Empty description={'Кроссы не найдены'}/>
          )}
        </Space>
      </div>
    </Card>
  )
}