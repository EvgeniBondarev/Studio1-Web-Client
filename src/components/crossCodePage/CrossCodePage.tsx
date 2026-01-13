import {Layout, Tree, Input, Spin, Empty, App, Typography, Modal} from 'antd'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useState} from 'react'
import {fetchPartsPageWithoutProducer, updatePart, createPart, deletePart} from '../../api/parts.ts'
import {fetchProducerById, updateProducer, createProducer, deleteProducer} from '../../api/producers.ts'
import {EntityFormModal} from '../EntityFormModal.tsx'
import {PartFormModal} from '../partsPanel/components/PartFormModal.tsx';
import {ProducerDetailsModal} from '../producerDetailsModal'
import {PartDetailsModal} from '../partDetailsModal'
import {producerFields} from '../../config/resources.ts'
import type {EtPart, EtProducer} from '../../api/types.ts'
import {type CrossTree, fetchAllByMainCode, findCrossTreeByMainCode} from '../../api/crossCode.ts';
import {useEntityMutation} from '../hooks/useEntityMutation.ts';
import {createCrossTreeMapper} from './crossTreeMapper.tsx';
import {useFormatDate} from '../hooks/useFormatDate.ts';

const {Content} = Layout
const {Text} = Typography

export const CrossCodePage = () => {
  const {message} = App.useApp()
  const {formatDate} = useFormatDate()
  const [inputValue, setInputValue] = useState('')
  const [mainCode, setMainCode] = useState('')
  const [editingPart, setEditingPart] = useState<EtPart | null>(null)
  const [editingProducer, setEditingProducer] = useState<EtProducer | null>(null)
  const [viewingPart, setViewingPart] = useState<EtPart | null>(null)
  const [viewingProducer, setViewingProducer] = useState<EtProducer | null>(null)
  const [viewingPartProducer, setViewingPartProducer] = useState<EtProducer | null>(null)
  const [isPartModalOpen, setIsPartModalOpen] = useState(false)
  const [isProducerModalOpen, setIsProducerModalOpen] = useState(false)


  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedInput = window.localStorage.getItem('crossSearchInput') ?? ''
    const savedMain = window.localStorage.getItem('crossMainCode') ?? ''
    if (savedInput) setInputValue(savedInput)
    if (savedMain) setMainCode(savedMain)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('crossSearchInput', inputValue)
  }, [inputValue])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mainCode) {
      window.localStorage.setItem('crossMainCode', mainCode)
    }
  }, [mainCode])

  useEffect(() => {
    const handler = setTimeout(() => {
      setMainCode(inputValue.trim())
    }, 1000)

    return () => clearTimeout(handler)
  }, [inputValue])

  const {data: allItems, isLoading: isLoadingAll} = useQuery({
    queryKey: ['cross-all', mainCode],
    queryFn: async ({signal}) => {
      return await fetchAllByMainCode(mainCode, signal)
    },
    enabled: !!mainCode.trim(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  const {data: tree, isLoading: isLoadingTree, isFetching} = useQuery<CrossTree | null>({
    queryKey: ['cross-tree', mainCode],
    queryFn: async ({signal}) => {
      try {
        return await findCrossTreeByMainCode(mainCode, signal)
      } catch (e) {
        message.error('Ошибка загрузки кросс-кодов')
        throw e
      }
    },
    enabled: !!mainCode.trim(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })


  const isLoading = isLoadingAll || isLoadingTree || isFetching
  const totalCount = allItems?.length ?? 0

  const partUpdateMutation = useEntityMutation(
    ({ id, payload }: { id: number; payload: Partial<EtPart> }) =>
      updatePart(id, payload),
    {
      successMessage: 'Деталь сохранена',
      invalidate: [
        ['cross-tree', mainCode],
        ['cross-all', mainCode],
      ],
      onSuccessExtra: () => {
        setIsPartModalOpen(false)
        setEditingPart(null)
      },
    })

  const partCreateMutation = useEntityMutation(
    (payload: Partial<EtPart>) => createPart(payload),
    {
      successMessage: 'Деталь добавлена',
      invalidate: [
        ['cross-tree', mainCode],
        ['cross-all', mainCode],
      ],
      onSuccessExtra: () => {
        setIsPartModalOpen(false)
        setEditingPart(null)
      },
    })

  const partDeleteMutation = useEntityMutation(
    (id: number) => deletePart(id),
    {
      successMessage: 'Деталь удалена',
      invalidate: [
        ['cross-tree', mainCode],
        ['cross-all', mainCode],
      ],
    })

  const producerUpdateMutation = useEntityMutation(
    ({ id, payload }: { id: number; payload: Partial<EtProducer> }) =>
      updateProducer(id, payload),
    {
      successMessage: 'Производитель сохранен',
      invalidate: [['cross-tree', mainCode]],
      onSuccessExtra: () => {
        setIsProducerModalOpen(false)
        setEditingProducer(null)
      },
    })

  const producerCreateMutation = useEntityMutation(
    (payload: Partial<EtProducer>) => createProducer(payload),
    {
      successMessage: 'Производитель добавлен',
      invalidate: [['cross-tree', mainCode]],
      onSuccessExtra: () => {
        setIsProducerModalOpen(false)
        setEditingProducer(null)
      },
    })

  const producerDeleteMutation = useEntityMutation(
    (id: number) => deleteProducer(id),
    {
      successMessage: 'Производитель удален',
      invalidate: [['cross-tree', mainCode]],
    })

  const handlePartView = async (code: string) => {
    try {
      const partsPage = await fetchPartsPageWithoutProducer(code, 'exact')
      const part = partsPage.items.find(p => p.Code === code)
      if (part) {
        const producer = part.ProducerId ? await fetchProducerById(part.ProducerId).catch(() => null) : null
        setViewingPartProducer(producer)
        setViewingPart(part)
      } else {
        message.warning('Деталь не найдена')
      }
    } catch (error) {
      message.error('Ошибка при загрузке детали')
    }
  }

  const handlePartEdit = async (code: string) => {
    try {
      const partsPage = await fetchPartsPageWithoutProducer(code, 'exact')
      const part = partsPage.items.find(p => p.Code === code)
      if (part) {
        setEditingPart(part)
        setIsPartModalOpen(true)
      } else {
        message.warning('Деталь не найдена')
      }
    } catch (error) {
      message.error('Ошибка при загрузке детали')
    }
  }

  const handlePartDelete = (part: EtPart) => {
    Modal.confirm({
      title: 'Удалить деталь?',
      content: `Вы уверены, что хотите удалить деталь ${part.Code ?? 'без кода'}?`,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okButtonProps: {danger: true, loading: partDeleteMutation.isPending},
      onOk: () => partDeleteMutation.mutate(part.Id),
    })
  }

  const handleProducerView = async (producerId: number) => {
    try {
      const producer = await fetchProducerById(producerId)
      setViewingProducer(producer)
    } catch (error) {
      message.error('Ошибка при загрузке производителя')
    }
  }

  const handleProducerEdit = async (producerId: number) => {
    try {
      const producer = await fetchProducerById(producerId)
      setEditingProducer(producer)
      setIsProducerModalOpen(true)
    } catch (error) {
      message.error('Ошибка при загрузке производителя')
    }
  }

  const handleProducerDelete = (producer: EtProducer) => {
    Modal.confirm({
      title: 'Удалить производителя?',
      content: `Вы уверены, что хотите удалить ${producer.Name ?? 'без названия'}?`,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okButtonProps: {danger: true, loading: producerDeleteMutation.isPending},
      onOk: () => producerDeleteMutation.mutate(producer.Id),
    })
  }

  const handlePartSubmit = (values: Partial<EtPart>) => {
    if (editingPart) {
      partUpdateMutation.mutate({id: editingPart.Id, payload: values})
    } else {
      partCreateMutation.mutate(values)
    }
  }

  const handleProducerSubmit = (values: Partial<EtProducer>) => {
    if (editingProducer) {
      producerUpdateMutation.mutate({id: editingProducer.Id, payload: values})
    } else {
      producerCreateMutation.mutate(values)
    }
  }

  const getProducerDisplayName = (producer?: EtProducer) => {
    if (!producer) return '—'
    const name = producer.Name ?? '—'
    const prefix = producer.MarketPrefix ?? producer.Prefix ?? ''
    return prefix ? `${name} (${prefix})` : name
  }

  const mapNodeToTreeData = createCrossTreeMapper({
    // producer
    onProducerView: handleProducerView,
    onProducerEdit: handleProducerEdit,
    onProducerDelete: handleProducerDelete,
    getProducerDisplayName,

    // part
    onPartView: handlePartView,
    onPartEdit: handlePartEdit,
    onPartDeleteByCode: async (code: string) => {
      const partsPage = await fetchPartsPageWithoutProducer(code, 'exact')
      const part = partsPage.items.find(p => p.Code === code)
      if (part) handlePartDelete(part)
    },

    // utils
    formatDate,
  })


  return (
    <Layout className="full-height">
      <Content style={{padding: 24, maxWidth: 1200}} className="full-height content-scroll">
        <h2>Поиск</h2>

        <Input.Search
          placeholder="Введите MainCode"
          allowClear
          enterButton="Найти"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onSearch={value => setMainCode(value.trim())}
          style={{marginBottom: 20}}
        />

        {isLoading ? (
          <Spin/>
        ) : !tree || !allItems?.length ? (
          <Empty description="Ничего не найдено"/>
        ) : (
          <>
            <div style={{marginBottom: 16}}>
              <Text type="secondary">Найдено кроссов: {totalCount}</Text>
            </div>
            <div className="cross-tree-container">
              <Tree
                defaultExpandAll
                showLine
                className="cross-tree"
                treeData={[
                  {
                    key: `main:${tree.mainCode}`,
                    title: <div className="cross-tree-main-row">
                      <span className="cross-tree-main-row__code"><b>{tree.mainCode}</b></span>
                      <span
                        className="cross-tree-main-row__producer">{getProducerDisplayName(tree.mainProducer)}</span>
                    </div>
                    ,
                    children: tree.nodes.map(node =>
                      mapNodeToTreeData(node, tree.mainCode)
                    ),
                  },
                ]}
              />
            </div>
          </>
        )}

        <PartFormModal
          open={isPartModalOpen}
          mode={editingPart ? 'edit' : 'create'}
          initialValues={editingPart ?? undefined}
          loading={partUpdateMutation.isPending || partCreateMutation.isPending}
          onCancel={() => {
            setIsPartModalOpen(false)
            setEditingPart(null)
          }}
          onSubmit={handlePartSubmit}
          brand={editingPart ? tree?.mainProducer?.Name : undefined}
        />

        <EntityFormModal<EtProducer>
          title={editingProducer ? 'Редактирование производителя' : 'Новый производитель'}
          open={isProducerModalOpen}
          onCancel={() => {
            setIsProducerModalOpen(false)
            setEditingProducer(null)
          }}
          onSubmit={handleProducerSubmit}
          fields={producerFields}
          loading={producerUpdateMutation.isPending || producerCreateMutation.isPending}
          initialValues={editingProducer ?? {Rating: 0}}
        />

        <ProducerDetailsModal
          producer={viewingProducer}
          onClose={() => setViewingProducer(null)}
        />

        <PartDetailsModal
          producer={viewingPartProducer}
          part={viewingPart}
          onClose={() => {
            setViewingPart(null)
            setViewingPartProducer(null)
          }}
        />
      </Content>
    </Layout>
  )
}
