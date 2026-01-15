import { useState } from 'react'
import {Input, Button, Select, Checkbox, Form, Flex} from 'antd'
import {SearchOutlined, SortAscendingOutlined} from '@ant-design/icons'
import type {SupplierSearchRequest} from '../../../../api/TecDoc/api/types.ts';


const { Option } = Select
const { Item: FormItem } = Form

interface Props {
  onSubmit: (request: SupplierSearchRequest) => void
  isLoading?: boolean
  initialQuery?: string
}

export const SupplierSearchForm=({
                                     onSubmit,
                                     isLoading = false,
                                     initialQuery = '',
                                   }: Props) =>{
  const [query, setQuery] = useState(initialQuery)
  const [sortBy, setSortBy] = useState<
    'relevance' | 'description' | 'matchcode' | 'nbrOfArticles'
  >('relevance')
  const [sortDescending, setSortDescending] = useState(false)

  const handleSubmit = () => {
    onSubmit({
      query: query.trim() || null,
      sortBy,
      sortDescending,
      page: 1,
      pageSize: 20,
    })
  }

  return (
    <Form
      onFinish={handleSubmit}
      style={{ width: '100%', padding: '0' }}
      layout="vertical"
    >
      {/* Первая строка: поиск и кнопка */}
      <Flex
        gap={8}
        align="flex-end"
        wrap="wrap"
        style={{ marginBottom: '16px' }}
      >
        <div style={{
          position: 'relative',
          flex: '1 1 300px',
          minWidth: '200px'
        }}>
          <SearchOutlined style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            color: '#bfbfbf',
            fontSize: '16px'
          }} />
          <Input
            size="large"
            placeholder="Введите название поставщика или код..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
            autoFocus
          />
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={isLoading}
          icon={<SearchOutlined />}
          style={{ flexShrink: 0 }}
        >
          Найти
        </Button>
      </Flex>

      {/* Вторая строка: сортировка и чекбокс */}
      <Flex
        gap={16}
        align="center"
        wrap="wrap"
      >
        <div style={{
          flex: '1 1 200px',
          minWidth: '200px'
        }}>
          <FormItem label="Сортировка" style={{ marginBottom: 0 }}>
            <Select
              value={sortBy}
              onChange={(value: any) => setSortBy(value)}
              style={{ width: '100%' }}
              size="middle"
              suffixIcon={<SortAscendingOutlined />}
            >
              <Option value="relevance">По релевантности</Option>
              <Option value="description">По описанию</Option>
              <Option value="matchcode">По коду</Option>
              <Option value="nbrOfArticles">По количеству артикулов</Option>
            </Select>
          </FormItem>
        </div>

        <Checkbox
          checked={sortDescending}
          onChange={(e) => setSortDescending(e.target.checked)}
          style={{ marginTop: '24px', flexShrink: 0 }}
        >
          По убыванию
        </Checkbox>
      </Flex>
    </Form>
  )
}