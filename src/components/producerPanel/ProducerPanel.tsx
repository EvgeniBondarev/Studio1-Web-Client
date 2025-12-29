import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Button, Empty, Flex, message, Space, Spin, Typography} from 'antd'
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons'
import type {EtProducer} from '../../api/types.ts';
import {fetchProducerById,} from '../../api/producers.ts';
import {ProducerRow} from './components/ProducerRow.tsx';
import {ProducerDetailsModal} from '../producerDetailsModal';
import {EntityFormModal} from '../EntityFormModal.tsx';
import {producerFields, type SearchType} from '../../config/resources.ts';
import {LinkToOriginalModal} from './components/LinkToOriginalModal.tsx';
import {ProducerListHeader} from './components/ProducerListHeader.tsx';
import {LoadMoreIndicator} from './components/LoadMoreIndicator.tsx';
import {useSortedProducers} from './hooks/useSortedProducers.ts';
import {useProducersPartsCount} from './hooks/useProducersPartsCount.ts';
import {ProducerFilters} from './components/ProducerFilters.tsx';
import {usePrefixFrequencyMap} from './hooks/usePrefixFrequencyMap.ts';
import {useFilteredProducers} from './hooks/useFilteredProducers.ts';
import {useMissingProducers} from './hooks/useMissingProducers.ts';
import {useProducerPages} from './hooks/useProducerPages.ts';
import {useInfiniteScroll} from '../hooks/useInfiniteScroll.ts';
import {useProducerSelection} from './hooks/useProducerSelection.tsx';
import {useProducerMutations} from './hooks/useProducerMutations.ts';

export type ProducerFilterMode = 'all' | 'originals' | 'non-originals' | 'with-prefix'
export type SortField = 'prefix' | 'name' | 'count';
export type SortOrder = 'asc' | 'desc';
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
  searchType?: SearchType
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
  const [isModalOpen, setModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<EtProducer | null>(null)
  const [previewProducer, setPreviewProducer] = useState<EtProducer | null>(null)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkTargetProducer, setLinkTargetProducer] = useState<EtProducer | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

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

  const {
    selectedProducerIds,
    clearSelection,
    handleProducerClick,
  } = useProducerSelection({
    searchType,
    selectedProducer,
    onSelect,
    onLinkRequested: (producer) => {
      setLinkTargetProducer(producer)
      setLinkModalOpen(true)
    },
  })

  useEffect(() => {
    if (searchType === 'without_producer') {
      clearSelection()
    }
  }, [searchType, clearSelection])

  // Пагинированная загрузка списка производителей
  const {
    allProducers,
    producerPages,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useProducerPages({search, filterMode})

  // Загружаем производителей по ID из найденных деталей, если они не в текущем списке
  const {missingProducers} = useMissingProducers({
    allProducers,
    searchType,
    filterProducerIds,
  })

  // Объединяем всех производителей и фильтруем по filterProducerIds, если нужно
  const filteredProducers = useFilteredProducers({
    allProducers,
    missingProducers,
    searchType,
    filterProducerIds,
  })

  // Загружаем количество деталей для каждого производителя
  const partsCountMap = useProducersPartsCount({producers: filteredProducers})

  // Подсчет частоты префиксов
  const prefixFrequencyMap = usePrefixFrequencyMap(filteredProducers)

  const sortedProducers = useSortedProducers({
    producers: filteredProducers,
    sortField,
    sortOrder,
    partsCountMap,
  });

  // Автоматическая загрузка при прокрутке
  useInfiniteScroll({
    loadMoreRef,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  })

  // Получаем общее количество из первой страницы
  const totalProducers = useMemo(() => producerPages[0]?.total ?? 0, [producerPages])

  const closeModal = () => {
    setModalOpen(false)
    setEditingProducer(null)
  }

  const {
    createProducer,
    updateProducer,
    confirmDelete,
    isSaving,
  } = useProducerMutations({
    onAfterSave: closeModal,
    onDeleted: (id) => {
      if (selectedProducer?.Id === id) {
        onSelect(null)
      }
    },
  })

  const handleSelectProducer = useCallback(async (producerId: number) => {
    try {
      const producer = await fetchProducerById(producerId)
      onSelect(producer)
      setPreviewProducer(null)
    } catch (error) {
      console.error('Ошибка при загрузке основного производителя:', error)
      message.error('Не удалось загрузить основного производителя')
    }
  }, [onSelect])

  const handleSubmit = (values: Partial<EtProducer>) => {
    if (editingProducer) {
      updateProducer({id: editingProducer.Id, payload: values})
    } else {
      createProducer(values)
    }
  }

  const handleView = useCallback((producer: EtProducer) => {setPreviewProducer(producer)}, [])

  const handleEdit = useCallback((producer: EtProducer) => {
    setEditingProducer(producer)
    setModalOpen(true)
  }, [])

  const handleDelete = useCallback((producer: EtProducer) => {confirmDelete(producer)}, [])

  const handleLinkClose = useCallback(() => {
    setLinkModalOpen(false)
    setLinkTargetProducer(null)
  }, [])

  const handleLinkSuccess = useCallback(() => {
    clearSelection()
    handleLinkClose()
  }, [clearSelection, handleLinkClose])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // Переключаем порядок сортировки
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    }
    else {
      // Устанавливаем новое поле и порядок по умолчанию
      setSortField(field);
      setSortOrder('asc')
    }
  }, [sortField, sortOrder])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    // Вызываем onSearchChange только если значение действительно изменилось и отличается от externalSearch
    if (onSearchChange && value !== externalSearch) {
      onSearchChange(value)
    }
  }, [onSearchChange, externalSearch]);

  const renderList = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" style={{minHeight: 200}}>
          <Spin/>
        </Flex>
      )
    }

    const listContent = sortedProducers.length ? (
      <>
        <ProducerListHeader
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
        <div className="producer-list">
          {sortedProducers.map((producer) => {

            const isActive = producer.Id === selectedProducer?.Id
            const prefix = producer.MarketPrefix ?? producer.Prefix ?? ''
            const prefixFrequency = prefixFrequencyMap.get(prefix) ?? 0

            return (
              <ProducerRow
                key={producer.Id}
                producer={producer}
                isSelected={selectedProducerIds.has(producer.Id)}
                isActive={isActive}
                onRowClick={handleProducerClick}
                onView={handleView}
                onEdit={handleEdit}
                prefix={prefix}
                prefixFrequency={prefixFrequency}
                onDelete={handleDelete}
                partsCountInfo={partsCountMap.get(producer.Id)}
              />
            )
          })}
        </div>
      </>
    ) : (
      <Empty description="Производители не найдены"/>
    )

    return (
      <>
        {listContent}
        <LoadMoreIndicator
          ref={loadMoreRef}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          totalProducers={totalProducers}
          loadedItemsCount={sortedProducers.length}
        />
      </>
    )
  }

  return (
    <Flex vertical style={{height: '100%'}} gap={8} className="panel">
      <Flex justify="space-between" align="center" className="panel-header" style={{marginBottom: 0}}>
        <Typography.Title level={5} style={{margin: 0}}>
          Производители
        </Typography.Title>
        <Space size={4}>
          <Button icon={<ReloadOutlined/>} onClick={() => refetch()} type="text" size="small"
                  loading={isFetching}/>
          <Button type="primary" icon={<PlusOutlined/>} size="small" onClick={() => setModalOpen(true)}>
            Добавить
          </Button>
        </Space>
      </Flex>

      <ProducerFilters
        search={search}
        onSearchChange={handleSearchChange}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
      />

      <div className="panel-body">{renderList()}</div>

      <ProducerDetailsModal
        producer={previewProducer}
        onClose={() => setPreviewProducer(null)}
        onSelectProducer={handleSelectProducer}
      />

      <EntityFormModal<EtProducer>
        title={editingProducer ? 'Редактирование производителя' : 'Новый производитель'}
        open={isModalOpen}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        fields={producerFields}
        loading={isSaving}
        initialValues={editingProducer ?? {Rating: 0}}
      />

      <LinkToOriginalModal open={linkModalOpen}
                           selectedProducerIds={selectedProducerIds}
                           filteredProducers={filteredProducers}
                           linkTargetProducer={linkTargetProducer}
                           onSuccess={handleLinkSuccess}
                           onCancel={handleLinkClose}
      />
    </Flex>
  )
}

