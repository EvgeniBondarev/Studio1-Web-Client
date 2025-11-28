import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Dropdown, Empty, Flex, Input, message, Modal, Space, Spin, Table, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { EtPart, EtProducer } from '../api/types.ts'
import { createPart, deletePart, fetchPartsPage, fetchStringsByIds, updatePart } from '../api/parts.ts'
import type { PartsPageResult } from '../api/parts.ts'
import { partFields } from '../config/resources.ts'
import { EntityFormModal } from './EntityFormModal.tsx'
import { PartDetailsDrawer } from './PartDetailsDrawer.tsx'

interface PartsPanelProps {
  producer?: EtProducer | null
  onSelectPart: (part: EtPart | null) => void
  selectedPart?: EtPart | null
}

export const PartsPanel = ({ producer, onSelectPart, selectedPart }: PartsPanelProps) => {
  const [search, setSearch] = useState('')
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
    queryKey: ['parts', producer?.Id],
    queryFn: ({ pageParam }) =>
      producer ? fetchPartsPage(producer.Id, pageParam as string | undefined) : Promise.resolve(undefined),
    enabled: Boolean(producer?.Id),
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
  const normalizeValue = (value?: string | null) =>
    value ? value.replace(/[^a-z0-9]/gi, '').toLowerCase() : ''
  const toLowerValue = (value?: string | null) => (value ? value.toLowerCase() : '')
  const trimmedSearch = search.trim()
  const rawSearchTerm = toLowerValue(trimmedSearch)
  const normalizedSearchTerm = normalizeValue(trimmedSearch)
  const stringsIds = useMemo(
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
    queryKey: ['partsStrings', producer?.Id, stringsIds],
    queryFn: () =>
      producer && stringsIds.length
        ? fetchStringsByIds(producer.Id, stringsIds)
        : Promise.resolve<Record<number, string>>({}),
    enabled: Boolean(producer?.Id) && stringsIds.length > 0,
  })

  const getStringValue = (id?: number) => (id ? stringsMap[id] : undefined)

  const filteredParts = useMemo(() => {
    if (!rawSearchTerm && !normalizedSearchTerm) {
      return parts
    }

    return parts.filter((part) => {
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
  }, [parts, rawSearchTerm, normalizedSearchTerm, stringsMap])

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
        multiple: 5,
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
    {
      title: 'Лп. код',
      dataIndex: 'LongCode',
      sorter: {
        compare: (a, b) => compareStrings(a.LongCode, b.LongCode),
        multiple: 4,
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
        multiple: 3,
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => renderStringValue(record.Name),
    },
    {
      title: 'Описание',
      dataIndex: 'Description',
      sorter: {
        compare: (a, b) => compareStringIds(a.Description, b.Description),
        multiple: 2,
      },
      sortDirections: ['ascend', 'descend'],
      render: (_, record) => renderStringValue(record.Description),
    },
    {
      title: 'Вес',
      dataIndex: 'Weight',
      sorter: {
        compare: (a, b) => compareNumbers(a.Weight, b.Weight),
        multiple: 1,
      },
      sortDirections: ['ascend', 'descend'],
      render: (value?: number) => (value ? `${value.toFixed(2)}` : '—'),
    },
  ]

  const renderBody = () => {
    if (!producer) {
      return <Empty description="Выберите производителя" />
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
    <Flex vertical gap="middle" style={{ height: '100%' }} className="panel">
      <Flex justify="space-between" align="center" className="panel-header">
        <Space align="center" size={12} wrap>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Детали
          </Typography.Title>
          {producer && (
            <>
              <Typography.Text type="secondary">
                Производитель: {producer.Name ?? producer.Prefix}
              </Typography.Text>
              <Typography.Text type="secondary">Деталей: {countLabel}</Typography.Text>
            </>
          )}
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReload}
            type="text"
            loading={isFetching}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!producer}
            onClick={() => setModalOpen(true)}
          >
            Добавить
          </Button>
        </Space>
      </Flex>

      <Input.Search
        placeholder="Поиск по коду"
        allowClear
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={!producer}
        className="panel-search"
      />

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

