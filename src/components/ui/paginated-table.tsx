import {Empty, Flex, Table} from 'antd'


interface Props<T> {
  items: T[]
  columns: any[]
  rowKey?: string | ((record: T) => string)
}

export function PaginatedTable<T>({
                                    items,
                                    columns,
                                    rowKey = 'id',
                                  }: Props<T>) {

  if (items.length === 0) {
    return (
      <Empty description={'Элементы не найдены'}></Empty>
    )
  }

  return (
    <Flex vertical gap={16} >
      <Table<T>
        columns={columns}
        dataSource={items}
        rowKey={rowKey}
        size="small"
        bordered={false}
        scroll={{ x: 'max-content' }}
        rowClassName="hover-row"
        pagination={{
          position: ['bottomCenter'],
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          locale: {
            items_per_page: '/ стр',
          },
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} из ${total}`,
        }}
      />
    </Flex>
  )
}
