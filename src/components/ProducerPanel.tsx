import { useMemo, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { Button, Empty, Flex, Input, List, message, Modal, Space, Spin, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  createProducer,
  deleteProducer,
  fetchProducersPage,
  updateProducer,
} from '../api/producers.ts'
import type { ProducersPageResult } from '../api/producers.ts'
import type { EtProducer } from '../api/types.ts'
import { EntityFormModal } from './EntityFormModal.tsx'
import { producerFields } from '../config/resources.ts'
import { ContextActionsMenu } from './ContextActionsMenu.tsx'
import { ProducerDetailsDrawer } from './ProducerDetailsDrawer.tsx'
import { fetchPartsCount } from '../api/parts.ts'

interface ProducerPanelProps {
  selectedProducer?: EtProducer | null
  onSelect: (producer: EtProducer | null) => void
}

export const ProducerPanel = ({ selectedProducer, onSelect }: ProducerPanelProps) => {
  const [search, setSearch] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<EtProducer | null>(null)
  const [previewProducer, setPreviewProducer] = useState<EtProducer | null>(null)
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['producers', search],
    queryFn: ({ pageParam }) => fetchProducersPage(search, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage?.nextLink ?? undefined,
    initialPageParam: undefined as string | undefined,
  })

  const producerPages = useMemo<ProducersPageResult[]>(() => {
    if (!data?.pages) {
      return []
    }
    return data.pages.filter((page): page is ProducersPageResult => Boolean(page))
  }, [data])

  const sortedProducers = useMemo(() => producerPages.flatMap((page) => page.items), [producerPages])
  const partsCountQueries = useQueries({
    queries: sortedProducers.map((producer) => ({
      queryKey: ['producerPartsCount', producer.Id],
      queryFn: () => fetchPartsCount(producer.Id),
      enabled: Boolean(producer.Id),
      staleTime: 5 * 60 * 1000,
    })),
  })
  const partsCountMap = useMemo(() => {
    const map = new Map<number, { value?: number; isLoading: boolean }>()
    sortedProducers.forEach((producer, index) => {
      const query = partsCountQueries[index]
      map.set(producer.Id, {
        value: query?.data ?? undefined,
        isLoading: query?.isLoading ?? false,
      })
    })
    return map
  }, [sortedProducers, partsCountQueries])

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
          <Typography.Text className="producer-row__cell producer-row__cell--prefix" type="secondary">
            Префикс
          </Typography.Text>
          <Typography.Text className="producer-row__cell producer-row__cell--name" type="secondary">
            Название
          </Typography.Text>
          <Typography.Text className="producer-row__cell producer-row__cell--count" type="secondary">
            Деталей
          </Typography.Text>
        </div>
        <List
          className="producer-list"
          dataSource={sortedProducers}
          split={false}
          renderItem={(producer) => {
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
            } else if (isNonOriginal) {
              rowClassNames.push('producer-row--inactive')
            }

            return (
              <ContextActionsMenu actions={actions}>
                <List.Item className="producer-row-wrapper" style={{ padding: 0 }} onClick={() => onSelect(producer)}>
                  <div className={rowClassNames.join(' ')}>
                    <Typography.Text
                      className="producer-row__cell producer-row__cell--prefix"
                      strong
                      title={producer.MarketPrefix ?? producer.Prefix ?? '—'}
                    >
                      {producer.MarketPrefix ?? producer.Prefix ?? '—'}
                    </Typography.Text>
                    <Typography.Text
                      className="producer-row__cell producer-row__cell--name"
                      title={producer.Name ?? '—'}
                    >
                      {producer.Name ?? '—'}
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
                </List.Item>
              </ContextActionsMenu>
            )
          }}
        />
      </>
    ) : (
      <Empty description="Производители не найдены" />
    )

    return (
      <>
        {listContent}
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

  return (
    <Flex vertical style={{ height: '100%' }} gap="middle" className="panel">
      <Flex justify="space-between" align="center" className="panel-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Производители
        </Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} type="text" loading={isFetching} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Добавить
          </Button>
        </Space>
      </Flex>

      <Input.Search
        placeholder="Поиск по названию или префиксу"
        allowClear
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="panel-search"
      />

      <div className="panel-body">{renderList()}</div>

      <ProducerDetailsDrawer producer={previewProducer} onClose={() => setPreviewProducer(null)} />

      <EntityFormModal<EtProducer>
        title={editingProducer ? 'Редактирование производителя' : 'Новый производитель'}
        open={isModalOpen}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        fields={producerFields}
        loading={createMutation.isPending || updateMutation.isPending}
        initialValues={editingProducer ?? { Rating: 0 }}
      />
    </Flex>
  )
}

