import {Layout, Tree, Input, Spin, Empty, App, Typography} from 'antd'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useState} from 'react'
import {EntityFormModal} from '../EntityFormModal.tsx'
import {PartFormModal} from '../partsPanel/components/PartFormModal.tsx';
import {ProducerDetailsModal} from '../producerDetailsModal'
import {PartDetailsModal} from '../partDetailsModal'
import {producerFields} from '../../config/resources.ts'
import type {EtPart, EtProducer} from '../../api/types.ts'
import {type CrossTree, fetchAllByMainCode, findCrossTreeByMainCode} from '../../api/crossCode.ts';
import {createCrossTreeMapper} from './crossTreeMapper.tsx';
import {useFormatDate} from '../hooks/useFormatDate.ts';
import {useCrossCodeActions} from './useCrossCodeActions.ts';

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

  const actions = useCrossCodeActions({
    mainCode,
    setEditingPart,
    setIsPartModalOpen,
    setViewingPart,
    setViewingPartProducer,
    setEditingProducer,
    setIsProducerModalOpen,
    setViewingProducer,
  })

  const handlePartSubmit = (values: Partial<EtPart>) => {
    if (editingPart) {
      actions.partUpdateMutation.mutate({id: editingPart.Id, payload: values})
    } else {
      actions.partCreateMutation.mutate(values)
    }
  }

  const handleProducerSubmit = (values: Partial<EtProducer>) => {
    if (editingProducer) {
      actions.producerUpdateMutation.mutate({id: editingProducer.Id, payload: values})
    } else {
      actions.producerCreateMutation.mutate(values)
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
    onProducerView: actions.handleProducerView,
    onProducerEdit: actions.handleProducerEdit,
    onProducerDelete: actions.handleProducerDelete,
    getProducerDisplayName,

    // part
    onPartView: actions.handlePartView,
    onPartEdit: actions.handlePartEdit,
    onPartDeleteByCode: actions.handlePartDeleteByCode,

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
          loading={actions.partUpdateMutation.isPending || actions.partCreateMutation.isPending}
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
          loading={actions.producerUpdateMutation.isPending || actions.producerCreateMutation.isPending}
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
