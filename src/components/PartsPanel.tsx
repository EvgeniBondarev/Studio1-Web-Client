import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Empty,
  Flex,
  Input,
  message,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { EtPart, EtProducer } from '../api/types.ts'
import { createPart, deletePart, fetchParts, updatePart } from '../api/parts.ts'
import { partFields } from '../config/resources.ts'
import { EntityFormModal } from './EntityFormModal.tsx'

interface PartsPanelProps {
  producer?: EtProducer | null
  onSelectPart: (part: EtPart | null) => void
  selectedPart?: EtPart | null
}

export const PartsPanel = ({ producer, onSelectPart, selectedPart }: PartsPanelProps) => {
  const [search, setSearch] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<EtPart | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['parts', producer?.Id, search],
    queryFn: () => (producer ? fetchParts(producer.Id, search) : Promise.resolve([])),
    enabled: Boolean(producer?.Id),
  })

  const parts = useMemo(() => data ?? [], [data])

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

  const columns: ColumnsType<EtPart> = [
    {
      title: 'Код',
      dataIndex: 'Code',
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value ?? '-'}</Typography.Text>
          <Typography.Text type="secondary">{record.LongCode}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Лп. код',
      dataIndex: 'LongCode',
      render: (value?: string) => value ?? '—',
    },
    {
      title: 'Наименование',
      dataIndex: 'Name',
      render: (value?: string) => value ?? '—',
    },
    {
      title: 'Описание',
      dataIndex: 'Description',
      render: (value?: string) => value ?? '—',
    },
    {
      title: 'Вес',
      dataIndex: 'Weight',
      render: (value?: number) => (value ? `${value.toFixed(2)}` : '—'),
    },
    {
      title: 'Флаги',
      dataIndex: 'NoChangeFlag',
      width: 160,
      render: (_, record) => (
        <Space size={4}>
          {record.Accepted && <Tag color="green">Принято</Tag>}
          {record.Deleted && <Tag color="red">Удалено</Tag>}
          {record.Old && <Tag color="orange">Старое</Tag>}
          {record.Dead && <Tag color="purple">Снят с производства</Tag>}
        </Space>
      ),
    },
    {
      title: '',
      dataIndex: 'actions',
      width: 96,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={(event) => {
              event.stopPropagation()
              setEditingPart(record)
              setModalOpen(true)
            }}
          />
          <Popconfirm
            title="Удалить деталь?"
            onConfirm={(event) => {
              event?.stopPropagation()
              deleteMutation.mutate(record.Id)
            }}
          >
            <Button icon={<DeleteOutlined />} type="text" danger loading={deleteMutation.isPending} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const renderBody = () => {
    if (!producer) {
      return <Empty description="Выберите производителя" />
    }

    if (isLoading) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: 200 }}>
          <Spin />
        </Flex>
      )
    }

    if (!parts.length) {
      return <Empty description="Пока нет деталей" />
    }

    return (
      <Table
        dataSource={parts}
        rowKey="Id"
        columns={columns}
        size="middle"
        pagination={false}
        onRow={(record) => ({
          onClick: () => onSelectPart(record),
        })}
        rowClassName={(record) => (record.Id === selectedPart?.Id ? 'table-row--active' : '')}
      />
    )
  }

  return (
    <Flex vertical gap="middle" style={{ height: '100%' }}>
      <Flex justify="space-between" align="center">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Детали
          </Typography.Title>
          {producer && (
            <Typography.Text type="secondary">Производитель: {producer.Name ?? producer.Prefix}</Typography.Text>
          )}
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} type="text" loading={isFetching} />
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
      />

      <div style={{ flex: 1, overflow: 'auto' }}>{renderBody()}</div>

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

