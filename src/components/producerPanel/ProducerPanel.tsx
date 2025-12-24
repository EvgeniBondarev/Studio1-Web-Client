import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {Button, Empty, Flex, message, Modal, Space, Spin, Typography} from 'antd'
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons'
import type {EtProducer} from '../../api/types.ts';
import {
    createProducer, deleteProducer,
    fetchProducerById,
    fetchProducersPage,
    type ProducersPageResult,
    updateProducer
} from '../../api/producers.ts';
import {ProducerRow} from './components/ProducerRow.tsx';
import {ProducerDetailsModal} from '../producerDetailsModal';
import {EntityFormModal} from '../EntityFormModal.tsx';
import {producerFields, type SearchType} from '../../config/resources.ts';
import * as React from 'react';
import {LinkToOriginalModal} from './components/LinkToOriginalModal.tsx';
import {ProducerListHeader} from './components/ProducerListHeader.tsx';
import {LoadMoreIndicator} from './components/LoadMoreIndicator.tsx';
import {useSortedProducers} from './hooks/useSortedProducers.ts';
import {useProducersPartsCount} from './hooks/useProducersPartsCount.ts';
import {ProducerFilters} from './components/ProducerFilters.tsx';
import {usePrefixFrequencyMap} from './hooks/usePrefixFrequencyMap.ts';
import {useFilteredProducers} from './hooks/useFilteredProducers.ts';
import {useMissingProducers} from './hooks/useMissingProducers.ts';

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
    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
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
        queryFn: ({pageParam}) =>
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
    const { missingProducers } = useMissingProducers({
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
    const partsCountMap = useProducersPartsCount({producers:filteredProducers})

    // Подсчет частоты префиксов
    const prefixFrequencyMap = usePrefixFrequencyMap(filteredProducers)

    const sortedProducers = useSortedProducers({
        producers: filteredProducers,
        sortField,
        sortOrder,
        partsCountMap,
    });

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

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Переключаем порядок сортировки
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            // Устанавливаем новое поле и порядок по умолчанию
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingProducer(null)
    }

    const createMutation = useMutation({
        mutationFn: createProducer,
        onSuccess: () => {
            message.success('Производитель создан')
            queryClient.invalidateQueries({queryKey: ['producers']})
            closeModal()
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({id, payload}: { id: number; payload: Partial<EtProducer> }) =>
            updateProducer(id, payload),
        onSuccess: () => {
            message.success('Изменения сохранены')
            queryClient.invalidateQueries({queryKey: ['producers']})
            closeModal()
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteProducer(id),
        onSuccess: (_, id) => {
            message.success('Производитель удалён')
            queryClient.invalidateQueries({queryKey: ['producers']})
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
            okButtonProps: {danger: true, loading: deleteMutation.isPending},
            onOk: () => deleteMutation.mutate(producer.Id),
        })
    }

    const handleProducerClick = (producer: EtProducer, event: React.MouseEvent<HTMLDivElement>) => {
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

    const handleSubmit = (values: Partial<EtProducer>) => {
        if (editingProducer) {
            updateMutation.mutate({id: editingProducer.Id, payload: values})
        } else {
            createMutation.mutate(values)
        }
    }

    const handleView = useCallback((producer: EtProducer) => {
        setPreviewProducer(producer)
    }, [])

    const handleEdit = useCallback((producer: EtProducer) => {
        setEditingProducer(producer)
        setModalOpen(true)
    }, [])

    const handleDelete = useCallback((producer: EtProducer) => {
        confirmDelete(producer)
    }, [])

    const handleLinkClose = useCallback(() => {
        setLinkModalOpen(false);
        setLinkTargetProducer(null);
    }, []);

    const handleLinkSuccess = useCallback(() => {
        setSelectedProducerIds(new Set());
        setLinkModalOpen(false);
        setLinkTargetProducer(null);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
      setSearch(value)
      // Вызываем onSearchChange только если значение действительно изменилось и отличается от externalSearch*/}
      if (onSearchChange && value !== externalSearch) {
        onSearchChange(value)
      }
    }, []);

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

