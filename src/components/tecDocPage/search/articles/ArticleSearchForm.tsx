import React, { useState, useEffect, useRef } from 'react'
import {Input, Button, Select, Checkbox, Form, List, Typography, type InputRef,} from 'antd'
const { Text } = Typography
import {
  SearchOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
  HomeOutlined
} from '@ant-design/icons'

// import { SupplierAutocomplete } from './supplier-autocomplete'

import type {ArticleSearchRequest} from '../../../../api/TecDoc/api/types.ts';
import {
  clearSearchHistory,
  getSearchHistory,
  historyItemToSearchRequest, removeSearchFromHistory,
  type SearchHistoryItem
} from '../../../../api/TecDoc/utils/search-history.ts';

interface Props {
  onSubmit: (request: ArticleSearchRequest) => void
  isLoading?: boolean
  initialQuery?: string
  initialSupplierId?: number
  initialSortBy?: 'relevance' | 'foundString' | 'description'
  initialSortDescending?: boolean
  onSupplierChange?: (supplierName?: string) => void
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)


    if (diffMins < 1) {
      return 'только что'
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'минуту' : diffMins < 5 ? 'минуты' : 'минут'} назад`
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }


  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Поисковая строка */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Input
            ref={searchInputRef}
            placeholder="Введите номер артикула или описание..."
            value={query}
            autoFocus
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
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
            <div
              ref={historyRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                maxHeight: 380,
                overflowY: 'auto',
                zIndex: 50,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f9fafb',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <ClockCircleOutlined />
                  <Text strong>
                    История поиска ({history.length})
                  </Text>
                </div>

                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleClearHistory}
                >
                  Очистить
                </Button>
              </div>

              {/* Items */}
              <List
                dataSource={history.slice(0, 10)}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleHistorySelect(item)}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <Text strong ellipsis>
                          {item.query}
                        </Text>

                        {item.supplierId && (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '2px 6px',
                              borderRadius: 6,
                            }}
                          >
                          <HomeOutlined />
                            {item.supplierName || `ID: ${item.supplierId}`}
                        </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          fontSize: 12,
                          color: '#9ca3af',
                          alignItems: 'center',
                        }}
                      >
                        <ClockCircleOutlined />
                        {formatTime(item.timestamp)}
                      </div>
                    </div>

                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={(e) => handleRemoveHistoryItem(item.id, e)}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          disabled={isLoading}
          icon={isLoading ? <LoadingOutlined /> : <SearchOutlined />}
        >
          {isLoading ? 'Поиск...' : 'Найти'}
        </Button>
      </div>

      {/* Фильтры */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'flex-end',
        }}
      >
        {/* Поставщик */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <Form.Item label="Поставщик (опционально)">
            {mounted ? (
              <div>SupplierAutocomplete</div>
              // <SupplierAutocomplete
              //   value={supplierId}
              //   onChange={(id) => {
              //     setSupplierId(id)
              //     // Сбрасываем название при изменении ID
              //     if (!id) setSupplierName(undefined)
              //   }}
              //   onSupplierSelect={(supplier) =>
              //     setSupplierName(supplier.description)
              //   }
              //   placeholder="Начните вводить название поставщика..."
              // />
            ) : (
              <Input disabled placeholder="Начните вводить название поставщика..." />
            )}
          </Form.Item>
        </div>

        {/* Сортировка */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <Form.Item label="Сортировка">
            <Select value={sortBy} onChange={(value)=>setSortBy(value)}>
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
        </div>

        {/* Убывание */}
        <Checkbox
          checked={sortDescending}
          onChange={(e) => setSortDescending(e.target.checked)}
        >
          По убыванию
        </Checkbox>
      </div>
    </Form>
  )
}
