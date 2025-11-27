import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Empty, Flex, Input, List, message, Popconfirm, Space, Spin, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { createProducer, deleteProducer, fetchProducers, updateProducer } from '../api/producers.ts'
import type { EtProducer } from '../api/types.ts'
import { EntityFormModal } from './EntityFormModal.tsx'
import { producerFields } from '../config/resources.ts'

interface ProducerPanelProps {
  selectedProducer?: EtProducer | null
  onSelect: (producer: EtProducer | null) => void
}

export const ProducerPanel = ({ selectedProducer, onSelect }: ProducerPanelProps) => {
  const [search, setSearch] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<EtProducer | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['producers', search],
    queryFn: () => fetchProducers(search),
  })

  const sortedProducers = useMemo(() => data ?? [], [data])

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

    if (!sortedProducers.length) {
      return <Empty description="Производители не найдены" />
    }

    return (
      <List
        dataSource={sortedProducers}
        renderItem={(producer) => {
          const isActive = producer.Id === selectedProducer?.Id
          return (
            <List.Item
              style={{
                cursor: 'pointer',
                background: isActive ? '#e6f4ff' : undefined,
                borderRadius: 8,
                paddingInline: 12,
              }}
              onClick={() => onSelect(producer)}
              actions={[
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  type="text"
                  onClick={(event) => {
                    event.stopPropagation()
                    setEditingProducer(producer)
                    setModalOpen(true)
                  }}
                />,
                <Popconfirm
                  key="delete"
                  title="Удалить производителя?"
                  okText="Удалить"
                  cancelText="Отмена"
                  onConfirm={(event) => {
                    event?.stopPropagation()
                    deleteMutation.mutate(producer.Id)
                  }}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    type="text"
                    danger
                    onClick={(event) => event.stopPropagation()}
                    loading={deleteMutation.isPending}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Typography.Text strong>{producer.Name ?? 'Без названия'}</Typography.Text>
                    {producer.MarketPrefix && <Typography.Text type="secondary">{producer.MarketPrefix}</Typography.Text>}
                  </Space>
                }
                description={
                  <Space size={16} style={{ width: '100%' }}>
                    <Typography.Text 
                      type="secondary" 
                      style={{ 
                        maxWidth: '80px', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={`ID: ${producer.Id}`}
                    >
                      ID: {producer.Id}
                    </Typography.Text>
                    {producer.Domain && (
                      <Typography.Text 
                        type="secondary"
                        style={{ 
                          maxWidth: '150px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={`Домен: ${producer.Domain}`}
                      >
                        Домен: {producer.Domain}
                      </Typography.Text>
                    )}
                  </Space>
                }
              />
              </List.Item>
          )
        }}
      />
    )
  }

  return (
    <Flex vertical style={{ height: '100%' }} gap="middle">
      <Flex justify="space-between" align="center">
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
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>{renderList()}</div>

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

