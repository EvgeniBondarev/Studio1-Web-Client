import { useState } from 'react'
import {Input, Button, Select, Checkbox, Form, Space, Col, Row} from 'antd'
import {SearchOutlined, SortAscendingOutlined} from '@ant-design/icons'
import type {SupplierSearchRequest} from '../../../../api/TecDoc/api/types.ts';


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
      layout="vertical"
      style={{ width: '100%' }}
    >
      {/* Первая строка: поиск и кнопка */}
      <Space.Compact style={{ width: '100%' }} size="middle">
        <Input
          size="large"
          placeholder="Введите название поставщика или код..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          style={{ flex: 1 }}
        />

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
      </Space.Compact>

      {/* Вторая строка: сортировка и чекбокс */}
      <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
        <Col flex="1 1 200px">
          <Form.Item label="Сортировка" style={{ marginBottom: 0 }}>
            <Select
              value={sortBy}
              onChange={(value: any) => setSortBy(value)}
              style={{ width: '100%' }}
              size="middle"
              suffixIcon={<SortAscendingOutlined />}
            >
              <Select.Option value="relevance">По релевантности</Select.Option>
              <Select.Option value="description">По описанию</Select.Option>
              <Select.Option value="matchcode">По коду</Select.Option>
              <Select.Option value="nbrOfArticles">По количеству артикулов</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col>
          <Form.Item label=" " style={{ marginBottom: 0 }}>
            <Checkbox
              checked={sortDescending}
              onChange={(e) => setSortDescending(e.target.checked)}
            >
              По убыванию
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}