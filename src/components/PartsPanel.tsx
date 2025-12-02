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
import { PartDetailsDrawer } from './PartDetailsDrawer.tsx'
import { PartFormModal } from './PartFormModal.tsx'

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
  autoEditPart?: EtPart | null
  onAutoEditProcessed?: () => void
  initialSearch?: string
  initialSearchType?: SearchType
}

export const PartsPanel = ({
  producer,
  onSelectPart,
  selectedPart,
  onFocusProducer,
  onSearchTypeChange,
  autoEditPart,
  onAutoEditProcessed,
  initialSearch,
  initialSearchType,
}: PartsPanelProps) => {
  const savedFilters = loadPartsFilterSettings()
  const [searchInput, setSearchInput] = useState(() => initialSearch ?? savedFilters?.searchInput ?? '')
  const [search, setSearch] = useState(() => initialSearch ?? savedFilters?.search ?? '')
  const [searchType, setSearchType] = useState<SearchType>(() => initialSearchType ?? savedFilters?.searchType ?? 'by_producer')
  
  // Синхронизация с initialSearch и initialSearchType (только при первом рендере или изменении)
  const initialSearchProcessedRef = useRef(false)
  const initialSearchTypeProcessedRef = useRef(false)
  
  useEffect(() => {
    if (initialSearch !== undefined && !initialSearchProcessedRef.current) {
      setSearchInput(initialSearch)
      setSearch(initialSearch)
      initialSearchProcessedRef.current = true
    }
  }, [initialSearch])
  
  useEffect(() => {
    if (initialSearchType !== undefined && !initialSearchTypeProcessedRef.current) {
      setSearchType(initialSearchType)
      onSearchTypeChange?.(initialSearchType)
      initialSearchTypeProcessedRef.current = true
    }
  }, [initialSearchType, onSearchTypeChange])
  const [codeFilterMode, setCodeFilterMode] = useState<CodeFilterMode>(() => savedFilters?.codeFilterMode ?? 'startsWith')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<EtPart | null>(null)
  const [previewPart, setPreviewPart] = useState<EtPart | null>(null)
  const [contextMenu, setContextMenu] = useState<{ partId: number; x: number; y: number } | null>(null)
  const queryClient = useQueryClient()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Закрываем контекстное меню при клике вне его
  useEffect(() => {
    if (!contextMenu) {
      return
    }
    const handleClick = () => {
      setContextMenu(null)
    }
    const handleContextMenu = () => {
      setContextMenu(null)
    }
    // Небольшая задержка, чтобы не закрыть меню сразу после открытия
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClick)
      document.addEventListener('contextmenu', handleContextMenu)
    }, 100)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [contextMenu])

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
      return producer
        ? fetchPartsPage(
            producer.Id,
            pageParam as string | undefined,
            search?.trim() || undefined,
            codeFilterMode,
          )
        : Promise.resolve(undefined)
    },
    enabled:
      searchType === 'without_producer'
        ? Boolean(search?.trim()) // Для "without_producer" ждем debounce
        : Boolean(producer?.Id), // Для "by_producer" нужен только producer
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

  // Динамический поиск при вводе для обоих режимов с debounce
  useEffect(() => {
    // Для режима "without_producer" добавляем debounce, чтобы не делать запрос при каждом символе
    if (searchType === 'without_producer') {
      const timer = setTimeout(() => {
        setSearch(searchInput.trim())
      }, 500) // Задержка 500мс

      return () => clearTimeout(timer)
    } else if (searchType === 'by_producer') {
      // Для режима "by_producer" поиск происходит сразу (фильтрация на клиенте)
      setSearch(searchInput.trim())
    }
  }, [searchInput, searchType])

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

  const filteredParts = useMemo(() => {
    // Если поиск без производителя, фильтрация уже выполнена на сервере
    if (searchType === 'without_producer') {
      return parts
    }

    // Для поиска по производителю Code уже отфильтрован на сервере
    // Применяем локальную фильтрацию только для остальных полей
    if (!rawSearchTerm && !normalizedSearchTerm) {
      return parts
    }

    return parts.filter((part) => {
      // Code уже отфильтрован на сервере по выбранному режиму
      // Проверяем только остальные поля (LongCode, Name, Description)
      const stringName = getStringValue(part.Name)
      const stringDescription = getStringValue(part.Description)
      const rawCandidates = [
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
  
  // Для режима "without_producer" показываем общее количество и количество на странице
  const countLabel = (() => {
    if (searchType === 'without_producer') {
      if (!search?.trim()) {
        return '—'
      }
      // Для режима "without_producer" filteredParts = parts (фильтрация на сервере)
      // parts.length - количество на текущей странице (все загруженные страницы)
      const currentPageCount = parts.length
      const total = resolvedTotalCount !== undefined ? resolvedTotalCount : '...'
      return `${currentPageCount.toLocaleString('ru-RU')} / ${typeof total === 'number' ? total.toLocaleString('ru-RU') : total}`
    }
    
    // Для режима "by_producer"
    if (!producer) {
      return '—'
    }
    
    if (trimmedSearch) {
      // При поиске показываем отфильтрованные / общее
      return `${filteredParts.length.toLocaleString('ru-RU')} / ${
        resolvedTotalCount !== undefined ? resolvedTotalCount.toLocaleString('ru-RU') : '...'
      }`
    }
    
    // Без поиска показываем только общее количество
    return resolvedTotalCount !== undefined ? resolvedTotalCount.toLocaleString('ru-RU') : '...'
  })()
  const initialLoading = isLoading && !parts.length

  // Функция для обрезки текста до 65 символов
  const truncateText = (text: string): string => {
    if (text.length <= 65) {
      return text
    }
    return text.substring(0, 65) + '...'
  }

  const renderStringValue = (id?: number) => {
    if (!id) {
      return '—'
    }

    if (stringsMap) {
      const text = stringsMap[id]
      if (text !== undefined) {
        if (!text) {
          return '—'
        }

        const truncated = truncateText(text)
        return (
          <Typography.Text
            title={text}
            style={{
              maxWidth: '100%',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {truncated}
          </Typography.Text>
        )
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

  // Автоматическое открытие редактирования при получении autoEditPart
  const processedAutoEditPartRef = useRef<EtPart | null | undefined>(undefined)
  useEffect(() => {
    // Открываем редактирование только если autoEditPart изменился и стал не null
    if (autoEditPart && producer && processedAutoEditPartRef.current !== autoEditPart) {
      setEditingPart(autoEditPart)
      setModalOpen(true)
      processedAutoEditPartRef.current = autoEditPart
      // Уведомляем родительский компонент, что обработка завершена
      onAutoEditProcessed?.()
    } else if (!autoEditPart) {
      processedAutoEditPartRef.current = undefined
    }
  }, [autoEditPart, producer, onAutoEditProcessed])

  const createMutation = useMutation({
    mutationFn: createPart,
    onSuccess: () => {
      message.success('Деталь добавлена')
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EtPart> }) => updatePart(id, payload),
    onSuccess: () => {
      message.success('Деталь сохранена')
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePart(id),
    onSuccess: (_, id) => {
      message.success('Деталь удалена')
      queryClient.invalidateQueries({ queryKey: ['parts'] })
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
      render: (value: string) => {
        if (!value) {
          return '-'
        }
        const truncated = truncateText(value)
        return (
          <Typography.Text
            strong
            title={value}
            style={{
              cursor: 'copy',
              display: 'block',
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.2',
            }}
            onClick={(event) => handleCopy(event, value)}
          >
            {truncated}
          </Typography.Text>
        )
      },
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
              const truncated = truncateText(label)
              return (
                <Typography.Link
                  title={label}
                  style={{
                    fontSize: 12,
                    maxWidth: '100%',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleProducerFilter(record.ProducerId)
                  }}
                >
                  {truncated}
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
      render: (value?: string) => {
        if (!value) {
          return '—'
        }
        const truncated = truncateText(value)
        return (
          <Typography.Text
            title={value}
            style={{
              cursor: 'copy',
              maxWidth: '100%',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            onClick={(event) => handleCopy(event, value)}
          >
            {truncated}
          </Typography.Text>
        )
      },
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
          const partId = record.Id
          const actions = partsActionsMap.get(partId)
          
          return {
            onClick: () => onSelectPart(record),
            onContextMenu: (e: MouseEvent<HTMLTableRowElement>) => {
              if (actions && actions.length > 0) {
                e.preventDefault()
                setContextMenu({ partId, x: e.clientX, y: e.clientY })
              }
            },
            className: (() => {
              const isActive = record.Id === selectedPart?.Id
              const isAccepted = record.Accepted
              if (isActive) {
                return 'table-row--active'
              }
              return isAccepted ? '' : 'table-row--inactive'
            })(),
          }
        }}
      />
    ) : (
      <Empty description={trimmedSearch ? 'Ничего не найдено' : 'Пока нет деталей'} />
    )

    return (
      <>
        {tableContent}
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
            {resolvedTotalCount !== undefined && typeof resolvedTotalCount === 'number' && resolvedTotalCount > parts.length && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Еще {((resolvedTotalCount - parts.length).toLocaleString('ru-RU'))} записей
              </Typography.Text>
            )}
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
          {searchType === 'by_producer' && producer && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Производитель: {producer.Name ?? producer.Prefix}
            </Typography.Text>
          )}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {searchType === 'without_producer' && search?.trim()
              ? `Найдено: ${countLabel}`
              : `Деталей: ${countLabel}`}
          </Typography.Text>
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
        <Space.Compact style={{ width: '100%' }} className="panel-search">
          {searchType === 'by_producer' && (
            <Select
              value={codeFilterMode}
              onChange={(value) => {
                setCodeFilterMode(value)
                // Не сбрасываем поиск, пересчет произойдет автоматически через useMemo
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
          )}
          <Input.Search
            placeholder="Поиск по коду"
            allowClear
            size="small"
            value={searchInput}
            onChange={(event) => {
              const { value } = event.target
              setSearchInput(value)
              // Поиск происходит динамически через useEffect для обоих режимов
              // Для режима "without_producer" с debounce, для "by_producer" сразу
              if (!value) {
                setSearch('')
              }
            }}
            onSearch={(value) => {
              // При нажатии Enter или кнопки поиска сразу применяем фильтр
              setSearch(value.trim())
              setSearchInput(value.trim())
            }}
            disabled={searchType === 'by_producer' && !producer}
            style={{ flex: 1 }}
          />
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
        </Space.Compact>
      </div>

      <div className="panel-body" ref={tableContainerRef}>
        {renderBody()}
      </div>

      {contextMenu && (
        <Dropdown
          open={true}
          menu={{
            items: partsActionsMap.get(contextMenu.partId)?.map((action) => ({
              key: action.key,
              label: action.label,
              onClick: (info) => {
                info.domEvent.stopPropagation()
                action.onClick()
                setContextMenu(null)
              },
              danger: action.danger,
            })) || [],
          }}
          trigger={['contextMenu']}
          onOpenChange={(open) => {
            if (!open) {
              setContextMenu(null)
            }
          }}
          getPopupContainer={() => document.body}
        >
          <div
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              width: 1,
              height: 1,
              pointerEvents: 'none',
            }}
          />
        </Dropdown>
      )}

      <PartDetailsDrawer producer={producer} part={previewPart} onClose={() => setPreviewPart(null)} />

      <PartFormModal
        open={isModalOpen}
        mode={editingPart ? 'edit' : 'create'}
        initialValues={editingPart ?? { Rating: 0 }}
        loading={createMutation.isPending || updateMutation.isPending}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Flex>
  )
}

