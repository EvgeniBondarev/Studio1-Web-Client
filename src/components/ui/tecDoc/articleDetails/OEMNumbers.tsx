import {Card, Input, Typography, Space, Tag, Empty} from 'antd';
import type {OeNumberDto} from '../../../../api/TecDoc/api/types.ts';
import {PaginatedTable} from '../../paginated-table.tsx';

const {Text, Title}=Typography;

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

  const oeColumns = [
    {
      title: '№',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: 'OEM номер',
      key: 'oeNumber',
      render: (record: OeNumberDto) => (
        <Text code>
          {record.oeNbr || record.oENbr || '—'}
        </Text>
      ),
    },
    {
      title: 'Тип',
      key: 'type',
      render: (record: OeNumberDto) => (
        record.isAdditive ? (
          <Tag color="blue" style={{backgroundColor: '#dbeafe', color: '#1e40af'}}>
            Добавка
          </Tag>
        ) : (
          <Tag color="green" style={{backgroundColor: '#dcfce7', color: '#166534'}}>
            Основной номер
          </Tag>
        )
      ),
    },
  ]

  return (
    <Card
      title={
        <Title level={4} style={{margin: 0}}>
          {`OEM номера (${resultCount}) ${showCountInfo ? ` из ${oeNumbersLength}` : ''}`}
        </Title>
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
            columns={oeColumns}
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