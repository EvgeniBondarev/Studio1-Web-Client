import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useInfiniteQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Button, Empty, Flex, Input, message, Modal, Select, Space, Spin, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, InfoCircleOutlined, LinkOutlined, PlusOutlined, QuestionCircleOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import {
  createProducer,
  deleteProducer,
  fetchProducersPage,
  updateProducer,
  linkProducers,
} from '../api/producers.ts'
import type { ProducersPageResult } from '../api/producers.ts'
import type { EtProducer } from '../api/types.ts'
import { EntityFormModal } from './EntityFormModal.tsx'
import { producerFields } from '../config/resources.ts'
import { ContextActionsMenu } from './ContextActionsMenu.tsx'
import { fetchProducerById } from '../api/producers.ts'
import { fetchPartsCount } from '../api/parts.ts'
import {ProducerDetailsModal} from './producerDetailsModal';

type ProducerFilterMode = 'all' | 'originals' | 'non-originals' | 'with-prefix'
const PRODUCER_FILTER_MODE_SESSION_KEY = 'producerFilterMode'

const loadProducerFilterMode = (): ProducerFilterMode => {
  if (typeof window === 'undefined') {
    return 'all'
  }
  const stored = window.sessionStorage.getItem(PRODUCER_FILTER_MODE_SESSION_KEY)
  return stored === 'originals' ? 'originals' : 'all'
}

interface ProducerPanelProps {
  selectedProducer?: EtProducer | null
  onSelect: (producer: EtProducer | null) => void
  externalSearch?: string
  onSearchChange?: (value: string) => void
  searchType?: 'by_producer' | 'without_producer'
  filterProducerIds?: number[]
}

export const ProducerPanel = ({
  selectedProducer,
  onSelect,
  externalSearch,
  onSearchChange,
  searchType = 'by_producer',
  filterProducerIds,
}: ProducerPanelProps) => {
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<ProducerFilterMode>(() => loadProducerFilterMode())
  // Синхронизируем externalSearch с локальным search, но только если они действительно отличаются
  const prevExternalSearchRef = useRef<string | undefined>(externalSearch)
  useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== prevExternalSearchRef.current) {
      prevExternalSearchRef.current = externalSearch
      setSearch(externalSearch)
    }
  }, [externalSearch])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.sessionStorage.setItem(PRODUCER_FILTER_MODE_SESSION_KEY, filterMode)
  }, [filterMode])

  const [isModalOpen, setModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<EtProducer | null>(null)
  const [previewProducer, setPreviewProducer] = useState<EtProducer | null>(null)
  const [sortField, setSortField] = useState<'prefix' | 'name' | 'count' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedProducerIds, setSelectedProducerIds] = useState<Set<number>>(new Set())
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkTargetProducer, setLinkTargetProducer] = useState<EtProducer | null>(null)
  const queryClient = useQueryClient()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Очищаем выделение при изменении режима поиска
  useEffect(() => {
    if (searchType === 'without_producer') {
      setSelectedProducerIds(new Set())
    }
  }, [searchType])

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['producers', search, filterMode],
    queryFn: ({ pageParam }) =>
      fetchProducersPage(
        search && search.trim() ? search.trim() : undefined,
        pageParam as string | undefined,
        {
          filterMode,
        },
      ),
    getNextPageParam: (lastPage) => lastPage?.nextLink ?? undefined,
    initialPageParam: undefined as string | undefined,
  })

  const producerPages = useMemo<ProducersPageResult[]>(() => {
    if (!data?.pages) {
      return []
    }
    return data.pages.filter((page): page is ProducersPageResult => Boolean(page))
  }, [data])

  const allProducers = useMemo(() => producerPages.flatMap((page) => page.items), [producerPages])
  
  // Загружаем производителей по ID из найденных деталей, если они не в текущем списке
  const missingProducerIds = useMemo(() => {
    if (searchType === 'without_producer' && filterProducerIds && filterProducerIds.length > 0) {
      const existingIds = new Set(allProducers.map((p) => p.Id))
      return filterProducerIds.filter((id) => !existingIds.has(id))
    }
    return []
  }, [searchType, filterProducerIds, allProducers])

  const missingProducersQueries = useQueries({
    queries: missingProducerIds.map((producerId) => ({
      queryKey: ['producer', producerId],
      queryFn: () => fetchProducerById(producerId),
      enabled: searchType === 'without_producer' && missingProducerIds.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const missingProducers = useMemo(() => {
    const producers: EtProducer[] = []
    missingProducersQueries.forEach((query) => {
      if (query.data) {
        producers.push(query.data)
      }
    })
    return producers
  }, [missingProducersQueries])

  // Объединяем всех производителей и фильтруем по filterProducerIds, если нужно
  const filteredProducers = useMemo(() => {
    const combined = [...allProducers, ...missingProducers]
    
    if (searchType === 'without_producer' && filterProducerIds && filterProducerIds.length > 0) {
      const filterSet = new Set(filterProducerIds)
      return combined.filter((producer) => filterSet.has(producer.Id))
    }
    
    return combined
  }, [allProducers, missingProducers, searchType, filterProducerIds])
  
  // Загружаем количество деталей для каждого производителя
  const partsCountQueries = useQueries({
    queries: filteredProducers.map((producer) => ({
      queryKey: ['producerPartsCount', producer.Id],
      queryFn: () => fetchPartsCount(producer.Id),
      enabled: Boolean(producer.Id),
      staleTime: 5 * 60 * 1000,
    })),
  })
  
  const partsCountMap = useMemo(() => {
    const map = new Map<number, { value?: number; isLoading: boolean }>()
    filteredProducers.forEach((producer, index) => {
      const query = partsCountQueries[index]
      map.set(producer.Id, {
        value: query?.data ?? undefined,
        isLoading: query?.isLoading ?? false,
      })
    })
    return map
  }, [filteredProducers, partsCountQueries])
  
  // Подсчет частоты префиксов
  const prefixFrequencyMap = useMemo(() => {
    const frequencyMap = new Map<string, number>()
    filteredProducers.forEach((producer) => {
      const prefix = producer.MarketPrefix ?? producer.Prefix ?? ''
      if (prefix && prefix !== '—') {
        frequencyMap.set(prefix, (frequencyMap.get(prefix) || 0) + 1)
      }
    })
    return frequencyMap
  }, [filteredProducers])

  const sortedProducers = useMemo(() => {
    if (!sortField) {
      return filteredProducers
    }
    
    const sorted = [...filteredProducers].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'prefix': {
          const prefixA = a.MarketPrefix ?? a.Prefix ?? ''
          const prefixB = b.MarketPrefix ?? b.Prefix ?? ''
          comparison = prefixA.localeCompare(prefixB, 'ru', { sensitivity: 'base' })
          break
        }
        case 'name': {
          const nameA = a.Name ?? ''
          const nameB = b.Name ?? ''
          comparison = nameA.localeCompare(nameB, 'ru', { sensitivity: 'base' })
          break
        }
        case 'count': {
          const countA = partsCountMap.get(a.Id)?.value ?? 0
          const countB = partsCountMap.get(b.Id)?.value ?? 0
          comparison = countA - countB
          break
        }
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return sorted
  }, [filteredProducers, sortField, sortOrder, partsCountMap])

  // Автоматическая загрузка при прокрутке
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      },
    )

    observer.observe(loadMoreRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  
  // Получаем общее количество из первой страницы
  const totalProducers = useMemo(() => {
    const firstPage = producerPages[0]
    return firstPage?.total
  }, [producerPages])

  const handleSort = (field: 'prefix' | 'name' | 'count') => {
    if (sortField === field) {
      // Переключаем порядок сортировки
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Устанавливаем новое поле и порядок по умолчанию
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const renderSortIcon = (field: 'prefix' | 'name' | 'count') => {
    if (sortField !== field) {
      return null
    }
    return sortOrder === 'asc' ? (
      <ArrowUpOutlined style={{ fontSize: 10, marginLeft: 4 }} />
    ) : (
      <ArrowDownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
    )
  }

  const renderRatingBadge = (rating?: number | null) => {
    if (rating === undefined || rating === null || rating < 0) {
      return (
        <span className="producer-rating producer-rating--unknown" title="Статус не задан">
          <QuestionCircleOutlined style={{ fontSize: 11 }} />
        </span>
      )
    }
    const clamped = Math.max(0, Math.min(10, rating))
    const level = clamped >= 7 ? 'high' : clamped >= 4 ? 'medium' : 'low'
    return (
      <span className={`producer-rating producer-rating--${level}`} title={`Рейтинг: ${clamped}`}>
        {Number.isInteger(clamped) ? clamped : clamped.toFixed(1)}
      </span>
    )
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProducer(null)
  }

  const createMutation = useMutation({
    mutationFn: createProducer,
    onSuccess: () => {
      message.success('Производитель создан')
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EtProducer> }) =>
      updateProducer(id, payload),
    onSuccess: () => {
      message.success('Изменения сохранены')
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProducer(id),
    onSuccess: (_, id) => {
      message.success('Производитель удалён')
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      if (selectedProducer?.Id === id) {
        onSelect(null)
      }
    },
  })

  const linkMutation = useMutation({
    mutationFn: ({ producerIds, targetProducerId }: { producerIds: number[]; targetProducerId: number }) =>
      linkProducers(producerIds, targetProducerId),
    onSuccess: () => {
      message.success('Ссылка на оригинал успешно создана')
      queryClient.invalidateQueries({ queryKey: ['producers'] })
      setSelectedProducerIds(new Set())
      setLinkModalOpen(false)
      setLinkTargetProducer(null)
    },
    onError: () => {
      message.error('Ошибка при создании ссылки на оригинал')
    },
  })

  const confirmDelete = (producer: EtProducer) => {
    Modal.confirm({
      title: 'Удалить производителя?',
      content: `Вы уверены, что хотите удалить ${producer.Name ?? 'без названия'}?`,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okButtonProps: { danger: true, loading: deleteMutation.isPending },
      onOk: () => deleteMutation.mutate(producer.Id),
    })
  }

  const handleProducerClick = (producer: EtProducer, event: MouseEvent) => {
    // Если зажат Ctrl, добавляем/убираем из выделения
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      event.stopPropagation()
      setSelectedProducerIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(producer.Id)) {
          newSet.delete(producer.Id)
        } else {
          newSet.add(producer.Id)
        }
        return newSet
      })
      return
    }

    // Если есть выделенные производители и клик без Ctrl, показываем модальное окно ссылки на оригинал
    if (selectedProducerIds.size > 0) {
      event.preventDefault()
      event.stopPropagation()
      setLinkTargetProducer(producer)
      setLinkModalOpen(true)
      return
    }

    // Стандартное поведение - выбор производителя
    if (searchType === 'without_producer') {
      message.info('Сейчас включён поиск деталей без привязки к производителю.')
      return
    }
    onSelect(producer)
  }

  const handleLinkConfirm = () => {
    if (!linkTargetProducer) {
      return
    }
    const producerIdsArray = Array.from(selectedProducerIds)
    if (producerIdsArray.length === 0) {
      return
    }
    linkMutation.mutate({
      producerIds: producerIdsArray,
      targetProducerId: linkTargetProducer.Id,
    })
  }

  const handleSubmit = (values: Partial<EtProducer>) => {
    if (editingProducer) {
      updateMutation.mutate({ id: editingProducer.Id, payload: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const renderList = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: 200 }}>
          <Spin />
        </Flex>
      )
    }

    const listContent = sortedProducers.length ? (
      <>
        <div className="producer-row producer-row--header">
          <Typography.Text 
            className="producer-row__cell producer-row__cell--prefix" 
            type="secondary"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => handleSort('prefix')}
          >
            Префикс {renderSortIcon('prefix')}
          </Typography.Text>
          <Typography.Text 
            className="producer-row__cell producer-row__cell--name" 
            type="secondary"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => handleSort('name')}
          >
            Название {renderSortIcon('name')}
          </Typography.Text>
          <Typography.Text 
            className="producer-row__cell producer-row__cell--count" 
            type="secondary"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => handleSort('count')}
          >
            Деталей {renderSortIcon('count')}
          </Typography.Text>
        </div>
        <div className="producer-list">
          {sortedProducers.map((producer) => {
          const isActive = producer.Id === selectedProducer?.Id
          const isNonOriginal =
            producer.RealId !== undefined && producer.RealId !== null && producer.RealId !== producer.Id

          const actions = [
            {
              key: 'view',
              label: (
                <Space size={6}>
                  <InfoCircleOutlined />
                  Просмотр
                </Space>
              ),
              onClick: () => setPreviewProducer(producer),
            },
            {
              key: 'edit',
              label: (
                <Space size={6}>
                  <EditOutlined />
                  Редактировать
                </Space>
              ),
              onClick: () => {
                setEditingProducer(producer)
                setModalOpen(true)
              },
            },
            {
              key: 'delete',
              label: (
                <Space size={6}>
                  <DeleteOutlined />
                  Удалить
                </Space>
              ),
              danger: true,
              onClick: () => confirmDelete(producer),
            },
          ]

            const rowClassNames = ['producer-row']
            if (isActive) {
              rowClassNames.push('producer-row--active')
            }
            if (selectedProducerIds.has(producer.Id)) {
              rowClassNames.push('producer-row--selected')
            }

            return (
              <ContextActionsMenu key={producer.Id} actions={actions}>
                <div
                  className="producer-row-wrapper"
                  style={{ padding: 0 }}
                  onClick={(e) => handleProducerClick(producer, e)}
                >
                  <div className={rowClassNames.join(' ')}>
                    <Typography.Text
                      className="producer-row__cell producer-row__cell--prefix"
                      strong
                      title={producer.MarketPrefix ?? producer.Prefix ?? '—'}
                    >
                      <span className="producer-prefix">
                        {renderRatingBadge(producer.Rating)}
                        <span>
                          {producer.MarketPrefix ?? producer.Prefix ?? '—'}
                          {(() => {
                            const prefix = producer.MarketPrefix ?? producer.Prefix ?? ''
                            if (prefix && prefix !== '—') {
                              const frequency = prefixFrequencyMap.get(prefix) ?? 0
                              if (frequency >= 2) {
                                return (
                                  <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                                    ({frequency})
                                  </Typography.Text>
                                )
                              }
                            }
                            return null
                          })()}
                        </span>
                      </span>
                    </Typography.Text>
                    <Typography.Text
                      className="producer-row__cell producer-row__cell--name"
                      title={producer.Name ?? '—'}
                    >
                      <Space size={4}>
                        {producer.Name ?? '—'}
                        {isNonOriginal && (
                          <LinkOutlined style={{ fontSize: 12, color: '#1890ff' }} />
                        )}
                      </Space>
                    </Typography.Text>
                    <Typography.Text
                      className="producer-row__cell producer-row__cell--count"
                      title={
                        typeof partsCountMap.get(producer.Id)?.value === 'number'
                          ? String(partsCountMap.get(producer.Id)?.value)
                          : undefined
                      }
                    >
                      {(() => {
                        const info = partsCountMap.get(producer.Id)
                        if (!info) {
                          return '—'
                        }
                        if (info.isLoading && info.value === undefined) {
                          return '…'
                        }
                        return typeof info.value === 'number' ? info.value.toLocaleString('ru-RU') : '—'
                      })()}
                    </Typography.Text>
                  </div>
                </div>
              </ContextActionsMenu>
            )
          })}
        </div>
      </>
    ) : (
      <Empty description="Производители не найдены" />
    )

    return (
      <>
        {listContent}
        {(hasNextPage || isFetchingNextPage) && (
          <Flex 
            ref={loadMoreRef}
            vertical 
            align="center" 
            style={{ padding: 12 }} 
            gap={4}
          >
            {isFetchingNextPage && (
              <Spin size="small" />
            )}
            {totalProducers !== undefined && totalProducers > sortedProducers.length && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Еще {((totalProducers - sortedProducers.length).toLocaleString('ru-RU'))} записей
              </Typography.Text>
            )}
          </Flex>
        )}
      </>
    )
  }

  return (
    <Flex vertical style={{ height: '100%' }} gap={8} className="panel">
      <Flex justify="space-between" align="center" className="panel-header" style={{ marginBottom: 0 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Производители
        </Typography.Title>
        <Space size={4}>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} type="text" size="small" loading={isFetching} />
          <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setModalOpen(true)}>
            Добавить
          </Button>
        </Space>
      </Flex>

      <Space.Compact style={{ width: '100%' }} className="panel-search">
      <Input.Search
        placeholder="Поиск по названию или префиксу"
        allowClear
          size="small"
        value={search}
          onChange={(event) => {
            const { value } = event.target
            setSearch(value)
            // Вызываем onSearchChange только если значение действительно изменилось и отличается от externalSearch
            if (onSearchChange && value !== externalSearch) {
              onSearchChange(value)
            }
          }}
          style={{ flex: 1 }}
        />
        <Select
          value={filterMode}
          onChange={(value: ProducerFilterMode) => setFilterMode(value)}
          size="small"
          style={{ width: 70 }}
          popupMatchSelectWidth={false}
          styles={{ popup: { root: { width: 170 } } }}
          options={[
            { value: 'all', label: 'Все производители' },
            { value: 'originals', label: 'Только оригинальные' },
            { value: 'non-originals', label: 'Не оригинальные' },
            { value: 'with-prefix', label: 'С заполненным префиксом' },
          ]}
        />
      </Space.Compact>

      <div className="panel-body">{renderList()}</div>

      <ProducerDetailsModal
        producer={previewProducer}
        onClose={() => setPreviewProducer(null)}
        onSelectProducer={async (producerId) => {
          try {
            const producer = await fetchProducerById(producerId)
            onSelect(producer)
            setPreviewProducer(null)
          } catch (error) {
            console.error('Ошибка при загрузке основного производителя:', error)
            message.error('Не удалось загрузить основного производителя')
          }
        }}
      />

      <EntityFormModal<EtProducer>
        title={editingProducer ? 'Редактирование производителя' : 'Новый производитель'}
        open={isModalOpen}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        fields={producerFields}
        loading={createMutation.isPending || updateMutation.isPending}
        initialValues={editingProducer ?? { Rating: 0 }}
      />

      <Modal
        title="Ссылка на оригинал"
        open={linkModalOpen}
        onOk={handleLinkConfirm}
        onCancel={() => {
          setLinkModalOpen(false)
          setLinkTargetProducer(null)
        }}
        okText="Связать с оригиналом"
        cancelText="Отмена"
        confirmLoading={linkMutation.isPending}
        width={600}
      >
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Typography.Text strong>Выбранные производители для ссылки на оригинал:</Typography.Text>
            <div
              style={{ marginTop: 8, maxHeight: 200, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}
            >
              {Array.from(selectedProducerIds)
                .map((id) => filteredProducers.find((p) => p.Id === id))
                .filter(Boolean)
                .map((producer) => (
                  <div key={producer!.Id} style={{ padding: '4px 0' }}>
                    <Space>
                      <Typography.Text strong>{producer!.Prefix ?? '—'}</Typography.Text>
                      <Typography.Text>{producer!.Name ?? '—'}</Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        (ID: {producer!.Id})
                      </Typography.Text>
                    </Space>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <Typography.Text strong>Связать с оригинальным производителем:</Typography.Text>
            <div style={{ marginTop: 8, padding: 12, background: 'var(--ant-color-fill-tertiary)', borderRadius: 4 }}>
              <Space orientation="vertical" size={4}>
                <Typography.Text strong>
                  {linkTargetProducer?.Name ?? '—'}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Префикс: {linkTargetProducer?.Prefix ?? '—'}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  ID: {linkTargetProducer?.Id}
                </Typography.Text>
              </Space>
            </div>
          </div>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            RealId выделенных производителей будет заменен на ID выбранного производителя ({linkTargetProducer?.Id}).
          </Typography.Text>
        </Space>
      </Modal>
    </Flex>
  )
}

