import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Dropdown, Empty, Flex, Input, message, Modal, Select, Space, Spin, Table, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { SortOrder } from 'antd/es/table/interface'
import type { EtPart, EtProducer } from '../api/types.ts'
import { createPart, deletePart, fetchPartsPage, fetchPartsPageWithoutProducer, fetchStringsByIds, updatePart } from '../api/parts.ts'
import type { PartsPageResult } from '../api/parts.ts'
import { fetchProducerById } from '../api/producers.ts'
import { partFields } from '../config/resources.ts'
import { EntityFormModal } from './EntityFormModal.tsx'
import { PartDetailsDrawer } from './PartDetailsDrawer.tsx'

type SearchType = 'by_producer' | 'without_producer'
type CodeFilterMode = 'exact' | 'startsWith' | 'endsWith' | 'contains'

const PARTS_FILTER_SESSION_KEY = 'partsPanelFilters'

interface PartsFilterSettings {
  searchInput: string
  search: string
  searchType: SearchType
  codeFilterMode: CodeFilterMode
}

const loadPartsFilterSettings = (): PartsFilterSettings | null => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.sessionStorage.getItem(PARTS_FILTER_SESSION_KEY)
    return raw ? (JSON.parse(raw) as PartsFilterSettings) : null
  } catch {
    return null
  }
}

interface PartsPanelProps {
  producer?: EtProducer | null
  onSelectPart: (part: EtPart | null) => void
  selectedPart?: EtPart | null
  onFocusProducer?: (producer: EtProducer) => void
  onSearchTypeChange?: (type: SearchType) => void
}

export const PartsPanel = ({
  producer,
  onSelectPart,
  selectedPart,
  onFocusProducer,
  onSearchTypeChange,
}: PartsPanelProps) => {
  const savedFilters = loadPartsFilterSettings()
  const [searchInput, setSearchInput] = useState(() => savedFilters?.searchInput ?? '')
  const [search, setSearch] = useState(() => savedFilters?.search ?? '')
  const [searchType, setSearchType] = useState<SearchType>(() => savedFilters?.searchType ?? 'by_producer')
  const [codeFilterMode, setCodeFilterMode] = useState<CodeFilterMode>(() => savedFilters?.codeFilterMode ?? 'exact')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<EtPart | null>(null)
  const [previewPart, setPreviewPart] = useState<EtPart | null>(null)
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchParts,
  } = useInfiniteQuery({
    queryKey: ['parts', producer?.Id, searchType, search, codeFilterMode],
    queryFn: ({ pageParam }) => {
      if (searchType === 'without_producer') {
        return fetchPartsPageWithoutProducer(search || undefined, 'exact', pageParam as string | undefined)
      }
      return producer ? fetchPartsPage(producer.Id, pageParam as string | undefined) : Promise.resolve(undefined)
    },
    enabled: searchType === 'without_producer' ? Boolean(search?.trim()) : Boolean(producer?.Id),
    getNextPageParam: (lastPage) => lastPage?.nextLink ?? undefined,
    initialPageParam: undefined as string | undefined,
  })

  const partsPages = useMemo<PartsPageResult[]>(() => {
    if (!data?.pages) {
      return []
    }
    return data.pages.filter((page): page is PartsPageResult => Boolean(page))
  }, [data])
  const parts = useMemo(() => partsPages.flatMap((page) => page.items), [partsPages])
  const totalParts = partsPages[0]?.total
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const hasProducer = Boolean(producer?.Id)

  useEffect(() => {
    tableContainerRef.current?.scrollTo({ top: 0 })
  }, [producer?.Id])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const payload: PartsFilterSettings = {
      searchInput,
      search,
      searchType,
      codeFilterMode,
    }
    window.sessionStorage.setItem(PARTS_FILTER_SESSION_KEY, JSON.stringify(payload))
  }, [searchInput, search, searchType, codeFilterMode])

  useEffect(() => {
    onSearchTypeChange?.(searchType)
  }, [searchType, onSearchTypeChange])
  const normalizeValue = (value?: string | null) =>
    value ? value.replace(/[^a-z0-9]/gi, '').toLowerCase() : ''
  const toLowerValue = (value?: string | null) => (value ? value.toLowerCase() : '')
  const trimmedSearch = search.trim()
  const rawSearchTerm = toLowerValue(trimmedSearch)
  const normalizedSearchTerm = normalizeValue(trimmedSearch)
  
  // Загружаем производителей для деталей, когда поиск без производителя
  const producerIds = useMemo(() => {
    if (searchType === 'without_producer') {
      return Array.from(new Set(parts.map((part) => part.ProducerId).filter((id): id is number => typeof id === 'number')))
    }
    return []
  }, [parts, searchType])

  const producersQueries = useQueries({
    queries: producerIds.map((producerId) => ({
      queryKey: ['producer', producerId],
      queryFn: () => fetchProducerById(producerId),
      enabled: searchType === 'without_producer',
      staleTime: 5 * 60 * 1000,
    })),
  })

  const producersMap = useMemo(() => {
    const map = new Map<number, EtProducer>()
    producersQueries.forEach((query, index) => {
      if (query.data) {
        map.set(producerIds[index], query.data)
      }
    })
    return map
  }, [producersQueries, producerIds])

  // Загружаем строки для деталей
  const stringsIdsForQuery = useMemo(
    () =>
      Array.from(
        new Set(
          parts
            .flatMap((part) => [part.Name, part.Description])
            .filter((id): id is number => typeof id === 'number'),
        ),
      ),
    [parts],
  )

  const {
    data: stringsMap = {},
    isFetching: isStringsFetching,
  } = useQuery<Record<number, string>>({
    queryKey: ['partsStrings', producer?.Id, stringsIdsForQuery, searchType, codeFilterMode],
    queryFn: () => {
      if (searchType === 'without_producer' && stringsIdsForQuery.length > 0) {
        // Для поиска без производителя нужно загружать строки для каждого производителя
        // Пока используем первый найденный ProducerId
        const firstProducerId = parts.find((p) => p.ProducerId)?.ProducerId
        if (firstProducerId) {
          return fetchStringsByIds(firstProducerId, stringsIdsForQuery)
        }
      }
      return producer && stringsIdsForQuery.length
        ? fetchStringsByIds(producer.Id, stringsIdsForQuery)
        : Promise.resolve<Record<number, string>>({})
    },
    enabled: (searchType === 'without_producer' && stringsIdsForQuery.length > 0) || (Boolean(producer?.Id) && stringsIdsForQuery.length > 0),
  })

  const getStringValue = (id?: number) => (id ? stringsMap[id] : undefined)

  const matchesCodeByMode = (code?: string | null) => {
    if (!rawSearchTerm) {
      return false
    }
    const codeValue = code?.toLowerCase() ?? ''
    switch (codeFilterMode) {
      case 'startsWith':
        return codeValue.startsWith(rawSearchTerm)
      case 'endsWith':
        return codeValue.endsWith(rawSearchTerm)
      case 'contains':
        return codeValue.includes(rawSearchTerm)
      case 'exact':
      default:
        return codeValue === rawSearchTerm
    }
  }

  const filteredParts = useMemo(() => {
    // Если поиск без производителя, фильтрация уже выполнена на сервере
    if (searchType === 'without_producer') {
      return parts
    }

    // Для поиска по производителю применяем локальную фильтрацию
    if (!rawSearchTerm && !normalizedSearchTerm) {
      return parts
    }

    return parts.filter((part) => {
      const matchesCodeFilter = matchesCodeByMode(part.Code)
      if (matchesCodeFilter) {
        return true
      }

      const stringName = getStringValue(part.Name)
      const stringDescription = getStringValue(part.Description)
      const rawCandidates = [
        toLowerValue(part.Code),
        toLowerValue(part.LongCode),
        toLowerValue(stringName),
        toLowerValue(stringDescription),
      ].filter(Boolean)

      if (rawSearchTerm && rawCandidates.some((candidate) => candidate.includes(rawSearchTerm))) {
        return true
      }

      if (!normalizedSearchTerm) {
        return false
      }

      const normalizedCandidates = [
        normalizeValue(part.Code),
        normalizeValue(part.LongCode),
        normalizeValue(stringName),
        normalizeValue(stringDescription),
      ].filter(Boolean)

      return normalizedCandidates.some((candidate) => candidate.includes(normalizedSearchTerm))
    })
  }, [parts, rawSearchTerm, normalizedSearchTerm, stringsMap, searchType])

  const handleProducerFilter = (producerId: number) => {
    if (!onFocusProducer) {
      return
    }

    const producerFromMap = producersMap.get(producerId)
    if (producerFromMap) {
      onFocusProducer(producerFromMap)
    }
  }

  const resolvedTotalCount = totalParts ?? (hasProducer ? parts.length : undefined)
  const countLabel = !producer
    ? '—'
    : trimmedSearch
      ? `${filteredParts.length.toLocaleString('ru-RU')} / ${
          resolvedTotalCount !== undefined ? resolvedTotalCount.toLocaleString('ru-RU') : '...'
        }`
      : resolvedTotalCount !== undefined
        ? resolvedTotalCount.toLocaleString('ru-RU')
        : '...'
  const initialLoading = isLoading && !parts.length

  const renderStringValue = (id?: number) => {
    if (!id) {
      return '—'
    }

    if (stringsMap) {
      const text = stringsMap[id]
      if (text !== undefined) {
        return text || '—'
      }
    }

    return isStringsFetching ? <Spin size="small" /> : '—'
  }

  const copyValue = async (value: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = value
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      message.success('Скопировано')
    } catch {
      message.error('Не удалось скопировать')
    }
  }

  const handleCopy = (event: MouseEvent<HTMLElement>, value?: string | null) => {
    event.stopPropagation()
    if (!value) {
      return
    }
    copyValue(value)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPart(null)
  }

  const createMutation = useMutation({
    mutationFn: createPart,
    onSuccess: () => {
      message.success('Деталь добавлена')
      queryClient.invalidateQueries({ queryKey: ['parts', producer?.Id] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EtPart> }) => updatePart(id, payload),
    onSuccess: () => {
      message.success('Деталь сохранена')
      queryClient.invalidateQueries({ queryKey: ['parts', producer?.Id] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePart(id),
    onSuccess: (_, id) => {
      message.success('Деталь удалена')
      queryClient.invalidateQueries({ queryKey: ['parts', producer?.Id] })
      if (selectedPart?.Id === id) {
        onSelectPart(null)
      }
    },
  })

  const confirmDelete = (part: EtPart) => {
    Modal.confirm({
      title: 'Удалить деталь?',
      content: `Вы уверены, что хотите удалить деталь ${part.Code ?? 'без кода'}?`,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okButtonProps: { danger: true, loading: deleteMutation.isPending },
      onOk: () => deleteMutation.mutate(part.Id),
    })
  }

  const handleSubmit = (values: Partial<EtPart>) => {
    if (!producer) {
      return
    }

    const payload = { ...values, ProducerId: producer.Id }
    if (editingPart) {
      updateMutation.mutate({ id: editingPart.Id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const compareStrings = (first?: string | null, second?: string | null) => {
    const aValue = first?.toLowerCase() ?? ''
    const bValue = second?.toLowerCase() ?? ''
    if (aValue < bValue) return -1
    if (aValue > bValue) return 1
    return 0
  }

  const compareNumbers = (first?: number | null, second?: number | null) => {
    const aValue = typeof first === 'number' ? first : Number.NEGATIVE_INFINITY
    const bValue = typeof second === 'number' ? second : Number.NEGATIVE_INFINITY
    if (aValue < bValue) return -1
    if (aValue > bValue) return 1
    return 0
  }

  const compareStringIds = (first?: number, second?: number) =>
    compareStrings(getStringValue(first) ?? '', getStringValue(second) ?? '')

  // Создаем маппинг actions для каждой детали
  const partsActionsMap = useMemo(() => {
    const map = new Map<number, Array<{ key: string; label: ReactNode; onClick: () => void; danger?: boolean }>>()
    filteredParts.forEach((part) => {
      map.set(part.Id, [
        {
          key: 'view',
          label: (
            <Space size={6}>
              <InfoCircleOutlined />
              Просмотр
            </Space>
          ),
          onClick: () => setPreviewPart(part),
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
            setEditingPart(part)
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
          onClick: () => confirmDelete(part),
        },
      ])
    })
    return map
  }, [filteredParts])

  const columns: ColumnsType<EtPart> = [
    {
      title: 'Код',
      dataIndex: 'Code',
      sorter: {
        compare: (a, b) => compareStrings(a.Code, b.Code),
        multiple: 6,
      },
      sortDirections: ['ascend', 'descend'],
      render: (value: string) => (
        <Typography.Text
          strong
          style={{ cursor: value ? 'copy' : 'default', display: 'block', lineHeight: '1.2' }}
          onClick={(event) => handleCopy(event, value)}
        >
          {value ?? '-'}
        </Typography.Text>
      ),
    },
    ...(searchType === 'without_producer'
      ? [
          {
            title: 'Производитель',
            dataIndex: 'ProducerId',
            sorter: {
              compare: (a: EtPart, b: EtPart) => {
                const producerA = producersMap.get(a.ProducerId)
                const producerB = producersMap.get(b.ProducerId)
                return compareStrings(producerA?.Name ?? producerA?.Prefix ?? '', producerB?.Name ?? producerB?.Prefix ?? '')
              },
              multiple: 5,
            },
            sortDirections: ['ascend', 'descend'] as SortOrder[],
            render: (_: unknown, record: EtPart) => {
              const producer = producersMap.get(record.ProducerId)
              if (!producer) {
                return <Spin size="small" />
              }
              const label = producer.Name ?? producer.Prefix ?? '—'
              return (
                <Typography.Link
                  style={{ fontSize: 12 }}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleProducerFilter(record.ProducerId)
                  }}
                >
                  {label}
                </Typography.Link>
              )
            },
          },
        ]
      : []),
    {
      title: 'Лп. код',
      dataIndex: 'LongCode',
      sorter: {
        compare: (a, b) => compareStrings(a.LongCode, b.LongCode),
        multiple: searchType === 'without_producer' ? 4 : 4,
      },
      sortDirections: ['ascend', 'descend'],
      render: (value?: string) => (
        <Typography.Text
          style={{ cursor: value ? 'copy' : 'default' }}
          onClick={(event) => handleCopy(event, value)}
        >
          {value ?? '—'}
        </Typography.Text>
      ),
    },
    {
      title: 'Наименование',
      dataIndex: 'Name',
      sorter: {
        compare: (a, b) => compareStringIds(a.Name, b.Name),
        multiple: searchType === 'without_producer' ? 3 : 3,
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => renderStringValue(record.Name),
    },
    {
      title: 'Описание',
      dataIndex: 'Description',
      sorter: {
        compare: (a, b) => compareStringIds(a.Description, b.Description),
        multiple: searchType === 'without_producer' ? 2 : 2,
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => renderStringValue(record.Description),
    },
    {
      title: 'Вес',
      dataIndex: 'Weight',
      sorter: {
        compare: (a, b) => compareNumbers(a.Weight, b.Weight),
        multiple: searchType === 'without_producer' ? 1 : 1,
      },
      sortDirections: ['ascend', 'descend'],
      render: (value?: number) => (value ? `${value.toFixed(2)}` : '—'),
    },
  ]

  const renderBody = () => {
    if (searchType === 'by_producer' && !producer) {
      return <Empty description="Выберите производителя" />
    }

    if (searchType === 'without_producer' && !search?.trim()) {
      return <Empty description="Введите код для поиска" />
    }

    if (initialLoading) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: 200 }}>
          <Spin />
        </Flex>
      )
    }

    const tableContent = filteredParts.length ? (
      <Table
        dataSource={filteredParts}
        rowKey="Id"
        columns={columns}
        size="small"
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => onSelectPart(record),
            className: (() => {
              const isActive = record.Id === selectedPart?.Id
              const isAccepted = record.Accepted
              if (isActive) {
                return 'table-row--active'
              }
              return isAccepted ? '' : 'table-row--inactive'
            })(),
            'data-part-id': record.Id,
          }
        }}
        components={{
          body: {
            row: (props: any) => {
              const partId = props['data-part-id']
              if (!partId) {
                return <tr {...props} />
              }

              const actions = partsActionsMap.get(partId)
              if (!actions) {
                return <tr {...props} />
              }

              const items = actions.map((action) => ({
                key: action.key,
                label: action.label,
                onClick: (info: any) => {
                  info.domEvent.stopPropagation()
                  action.onClick()
                },
                danger: action.danger,
              }))

              // Используем компонент-обертку для контекстного меню
              const TableRowWithContextMenu = ({ children, ...rowProps }: any) => {
                return (
                  <Dropdown trigger={['contextMenu']} menu={{ items }} getPopupContainer={(trigger) => trigger.parentElement || document.body}>
                    <tr {...rowProps}>{children}</tr>
                  </Dropdown>
                )
              }

              return <TableRowWithContextMenu {...props} />
            },
          },
        }}
      />
    ) : (
      <Empty description={trimmedSearch ? 'Ничего не найдено' : 'Пока нет деталей'} />
    )

    return (
      <>
        {tableContent}
        {(hasNextPage || isFetchingNextPage) && (
          <Flex justify="center" style={{ padding: 12 }}>
            <Button onClick={() => fetchNextPage()} loading={isFetchingNextPage} disabled={!hasNextPage}>
              Дальше
            </Button>
          </Flex>
        )}
      </>
    )
  }

  const handleReload = () => {
    refetchParts()
  }

  return (
    <Flex vertical gap={8} style={{ height: '100%' }} className="panel">
      <Flex justify="space-between" align="center" className="panel-header" style={{ marginBottom: 0 }}>
        <Space align="center" size={8} wrap>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Детали
          </Typography.Title>
          {producer && (
            <>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Производитель: {producer.Name ?? producer.Prefix}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>Деталей: {countLabel}</Typography.Text>
            </>
          )}
        </Space>
        <Space size={4}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReload}
            type="text"
            size="small"
            loading={isFetching}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            disabled={!producer}
            onClick={() => setModalOpen(true)}
          >
            Добавить
          </Button>
        </Space>
      </Flex>

      <div style={{ position: 'relative' }}>
        <Input.Search
          placeholder="Поиск по коду"
          allowClear
          size="small"
          value={searchInput}
          onChange={(event) => {
            const { value } = event.target
            setSearchInput(value)
            if (!value) {
              setSearch('')
            }
          }}
          onSearch={(value) => setSearch(value.trim())}
          disabled={searchType === 'by_producer' && !producer}
          className="panel-search"
          addonAfter={
            <Select
              value={searchType}
              onChange={(value) => {
                setSearchType(value)
                setSearch('')
                setSearchInput('')
              }}
              size="small"
              style={{ width: 180 }}
              options={[
                { value: 'by_producer', label: 'По производителю' },
                { value: 'without_producer', label: 'Без учета производителя' },
              ]}
            />
          }
          addonBefore={
            searchType === 'by_producer' ? (
              <Select
                value={codeFilterMode}
                onChange={(value) => {
                  setCodeFilterMode(value)
                  setSearch('')
                  setSearchInput('')
                }}
                size="small"
                style={{ width: 170 }}
                options={[
                  { value: 'exact', label: 'Точное совпадение' },
                  { value: 'startsWith', label: 'Начинается с' },
                  { value: 'endsWith', label: 'Заканчивается на' },
                  { value: 'contains', label: 'Содержит' },
                ]}
              />
            ) : undefined
          }
        />
      </div>

      <div className="panel-body" ref={tableContainerRef}>
        {renderBody()}
      </div>

      <PartDetailsDrawer producer={producer} part={previewPart} onClose={() => setPreviewPart(null)} />

      <EntityFormModal<EtPart>
        title={editingPart ? 'Редактирование детали' : 'Новая деталь'}
        open={isModalOpen}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        fields={partFields}
        loading={createMutation.isPending || updateMutation.isPending}
        initialValues={editingPart ?? { Weight: 0 }}
      />
    </Flex>
  )
}

