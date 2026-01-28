import React, {useState, useEffect, useRef} from 'react'
import {
  Input,
  Space,
  Button,
  Select,
  Checkbox,
  Form,
  List,
  Typography,
  type InputRef,
  Card,
  Tag,
  Flex,
  Col, Row,
} from 'antd'
import {
  SearchOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
  HomeOutlined
} from '@ant-design/icons'
import type {ArticleSearchRequest} from '../../../../api/TecDoc/api/types.ts';
import {
  clearSearchHistory,
  getSearchHistory,
  historyItemToSearchRequest, removeSearchFromHistory,
  type SearchHistoryItem
} from '../../../../api/TecDoc/utils/search-history.ts';
import SupplierAutocomplete from '../../../ui/tecDoc/SupplierAutocomplete.tsx';
import dayjs from '../../../../lib/dayjs.ts';

const {Text} = Typography

interface Props {
  onSubmit: (request: ArticleSearchRequest) => void
  isLoading?: boolean
  initialQuery?: string
  initialSupplierId?: number
  initialSortBy?: 'relevance' | 'foundString' | 'description'
  initialSortDescending?: boolean
  onSupplierChange?: (supplierName?: string) => void
}

export const formatTime = (timestamp: number) => {
  const date = dayjs(timestamp)
  const diffDays = dayjs().diff(date, 'day')

  if (diffDays < 7) {
    return date.fromNow()
  }

  return date.format('D MMM, HH:mm')
}

export function ArticleSearchForm({
                                    onSubmit,
                                    isLoading = false,
                                    initialQuery = '',
                                    initialSupplierId,
                                    initialSortBy = 'relevance',
                                    initialSortDescending = false,
                                    onSupplierChange,
                                  }: Props) {
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const [supplierId, setSupplierId] = useState<number | undefined>(initialSupplierId)
  const [supplierName, setSupplierName] = useState<string | undefined>()
  const [sortBy, setSortBy] = useState<'relevance' | 'foundString' | 'description'>(initialSortBy)
  const [sortDescending, setSortDescending] = useState(initialSortDescending)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const searchInputRef = useRef<InputRef>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setHistory(getSearchHistory())
  }, [])

  // Закрытие истории при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !(searchInputRef.current as any).input.contains(event.target)
      ) {
        setShowHistory(false)
      }
    }
    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showHistory])

  // Синхронизируем состояние с пропсами при их изменении
  useEffect(() => setQuery(initialQuery), [initialQuery])
  useEffect(() => setSupplierId(initialSupplierId), [initialSupplierId])
  useEffect(() => setSortBy(initialSortBy), [initialSortBy])
  useEffect(() => setSortDescending(initialSortDescending), [initialSortDescending])

  const handleSubmit = () => {
    const request = {
      query: query.trim() || null,
      supplierId,
      sortBy,
      sortDescending,
      page: 1,
      pageSize: 20,
    }
    onSubmit(request)
    setShowHistory(false)

    // Уведомляем родителя об изменении поставщика для истории
    if (onSupplierChange) onSupplierChange(supplierName)
  }

  const handleHistorySelect = (item: SearchHistoryItem) => {
    const request = historyItemToSearchRequest(item)
    setQuery(item.query)
    setSupplierId(item.supplierId)
    setSupplierName(item.supplierName)
    setSortBy(item.sortBy || 'relevance')
    setSortDescending(item.sortDescending || false)
    setShowHistory(false)
    onSubmit(request)

    if (onSupplierChange) onSupplierChange(item.supplierName)
  }

  const handleRemoveHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeSearchFromHistory(id)
    setHistory(getSearchHistory())
  }

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Очистить всю историю поиска?')) {
      clearSearchHistory()
      setHistory([])
    }
  }

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit}
      style={{display: 'flex', flexDirection: 'column', gap: 16}}
    >
      {/* Поисковая строка */}
      <Space.Compact style={{width: '100%'}} size={'middle'}>
        <div style={{flex: 1, position: 'relative'}}>
          <Input
            ref={searchInputRef}
            placeholder="Введите номер артикула или описание..."
            value={query}
            autoFocus
            prefix={<SearchOutlined style={{color: '#9ca3af'}}/>}
            onChange={(e) => {
              setQuery(e.target.value)
              // Показываем историю только если поле пустое или при фокусе
              if (!e.target.value.trim()) {
                setShowHistory(true)
              } else {
                setShowHistory(false)
              }
            }}
            onFocus={() => {
              if (!query.trim() && history.length > 0) {
                setShowHistory(true)
              }
            }}
          />

          {/* История поиска */}
          {showHistory && history.length > 0 && (
            <Card
              ref={historyRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                zIndex: 50,
                maxHeight: 380,
                overflowY: 'auto',
              }}
              styles={{body: {padding: 0}}}
            >
              {/* Header */}
              <Space
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  justifyContent: 'space-between',
                }}
              >
                <Space size={8}>
                  <ClockCircleOutlined/>
                  <Text strong>История поиска ({history.length})</Text>
                </Space>

                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined/>}
                  onClick={handleClearHistory}
                >
                  Очистить
                </Button>
              </Space>

              {/* Items */}
              <List
                dataSource={history.slice(0, 15)}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleHistorySelect(item)}
                  >
                    <Flex vertical style={{flex: 1}}>
                      <Space size={8} style={{marginBottom: 4}}>
                        <Text strong ellipsis>
                          {item.query}
                        </Text>

                        {item.supplierId && (
                          <Tag
                            icon={<HomeOutlined/>}
                            color="default"
                          >
                            {item.supplierName || `ID: ${item.supplierId}`}
                          </Tag>
                        )}
                      </Space>

                      <Space size={'small'} style={{fontSize: 12, color: '#9ca3af'}}>
                        <ClockCircleOutlined/>
                        <Text type="secondary">
                          {formatTime(item.timestamp)}
                        </Text>
                      </Space>
                    </Flex>

                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined/>}
                      onClick={(e) => handleRemoveHistoryItem(item.id, e)}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          disabled={isLoading}
          icon={isLoading ? <LoadingOutlined/> : <SearchOutlined/>}
        >
          {isLoading ? 'Поиск...' : 'Найти'}
        </Button>
      </Space.Compact>

      {/* Фильтры */}
      <Row gutter={[16, 16]} align="bottom">
        {/* Поставщик */}
        <Col flex="1 1 200px">
          <Form.Item label="Поставщик (опционально)">
            {mounted ? (
              <SupplierAutocomplete
                value={supplierId}
                onChange={(id) => {
                  setSupplierId(id)
                  if (!id) setSupplierName(undefined)
                }}
                onSupplierSelect={(supplier) =>
                  setSupplierName(supplier.description)
                }
                placeholder="Начните вводить название поставщика..."
              />
            ) : (
              <Input
                disabled
                placeholder="Начните вводить название поставщика..."
              />
            )}
          </Form.Item>
        </Col>

        {/* Сортировка */}
        <Col flex="1 1 200px">
          <Form.Item label="Сортировка">
            <Select value={sortBy} onChange={setSortBy}>
              <Select.Option value="relevance">
                По релевантности
              </Select.Option>
              <Select.Option value="foundString">
                По номеру артикула
              </Select.Option>
              <Select.Option value="description">
                По описанию
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Убывание */}
        <Col>
          <Form.Item label=" ">
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
