import {useEffect, useRef, useState, type MouseEvent, type ChangeEvent} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Empty, Flex, message, Modal, Spin, Table, Typography} from 'antd'
import type {ColumnsType} from 'antd/es/table'
import type {SortOrder} from 'antd/es/table/interface'
import {
    createPart,
    deletePart,
    updatePart
} from '../../api/parts.ts'
import type {EtPart, EtProducer} from '../../api/types.ts';
import {PartDetailsDrawer} from '../PartDetailsDrawer.tsx';
import {PartFormModal} from '../partFormModal/PartFormModal.tsx';
import {PartsHeader} from './PartsHeader.tsx';
import {PartsSearch} from './PartsSearch.tsx';
import {type ContextMenuPosition, PartsContextMenu} from './PartsContextMenu.tsx';
import {usePartsActionsMap} from './usePartsActionsMap.tsx';
import {usePartsFilter} from './usePartsFilter.tsx';
import {usePartsData} from './usePartsData.ts';

export type SearchType = 'by_producer' | 'without_producer'
export type CodeFilterMode = 'exact' | 'startsWith' | 'endsWith' | 'contains'

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

    const {
        searchInput,
        search,
        searchType,
        codeFilterMode,
        setSearchInput,
        setSearch,
        setCodeFilterMode,
        handleSearchTypeChange,
    } = usePartsFilter({
        initialSearch,
        initialSearchType,
        onSearchTypeChange,
    })

    const [isModalOpen, setModalOpen] = useState(false)
    const [editingPart, setEditingPart] = useState<EtPart | null>(null)
    const [previewPart, setPreviewPart] = useState<EtPart | null>(null)
    const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null)
    const queryClient = useQueryClient()
    const loadMoreRef = useRef<HTMLDivElement>(null)

    const normalizeValue = (value?: string | null) =>
        value ? value.replace(/[^a-z0-9]/gi, '').toLowerCase() : ''
    const toLowerValue = (value?: string | null) => (value ? value.toLowerCase() : '')
    const trimmedSearch = search.trim()
    const rawSearchTerm = toLowerValue(trimmedSearch)
    const normalizedSearchTerm = normalizeValue(trimmedSearch)

    const {
        parts,
        filteredParts,
        totalParts,
        producersMap,
        stringsMap,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        isStringsFetching,
        fetchNextPage,
        refetchParts,
        getStringValue,
    } = usePartsData({
        producer,
        searchType,
        search,
        codeFilterMode,
        normalizedSearchTerm,
        rawSearchTerm,
    })

    const tableContainerRef = useRef<HTMLDivElement>(null)
    const hasProducer = Boolean(producer?.Id)

    useEffect(() => {
        tableContainerRef.current?.scrollTo({top: 0})
    }, [producer?.Id])

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

        return isStringsFetching ? <Spin size="small"/> : '—'
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
            queryClient.invalidateQueries({queryKey: ['parts']})
            closeModal()
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({id, payload}: { id: number; payload: Partial<EtPart> }) => updatePart(id, payload),
        onSuccess: () => {
            message.success('Деталь сохранена')
            queryClient.invalidateQueries({queryKey: ['parts']})
            closeModal()
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePart(id),
        onSuccess: (_, id) => {
            message.success('Деталь удалена')
            queryClient.invalidateQueries({queryKey: ['parts']})
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
            okButtonProps: {danger: true, loading: deleteMutation.isPending},
            onOk: () => deleteMutation.mutate(part.Id),
        })
    }

    const handleSubmit = (values: Partial<EtPart>) => {
        if (!producer) {
            return
        }

        const payload = {...values, ProducerId: producer.Id}
        if (editingPart) {
            updateMutation.mutate({id: editingPart.Id, payload})
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
    const partsActionsMap = usePartsActionsMap({
        filteredParts,
        onView: (part) => setPreviewPart(part),
        onEdit: (part) => {
            setEditingPart(part)
            setModalOpen(true)
        },
        onDelete: (part) => confirmDelete(part),
    })

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
                            return <Spin size="small"/>
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
            return <Empty description="Выберите производителя"/>
        }

        if (searchType === 'without_producer' && !search?.trim()) {
            return <Empty description="Введите код для поиска"/>
        }

        if (initialLoading) {
            return (
                <Flex justify="center" align="center" style={{minHeight: 200}}>
                    <Spin/>
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
                                setContextMenu({partId, x: e.clientX, y: e.clientY})
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
            <Empty description={trimmedSearch ? 'Ничего не найдено' : 'Пока нет деталей'}/>
        )

        return (
            <>
                {tableContent}
                {(hasNextPage || isFetchingNextPage) && (
                    <Flex
                        ref={loadMoreRef}
                        vertical
                        align="center"
                        style={{padding: 12}}
                        gap={4}
                    >
                        {isFetchingNextPage && (
                            <Spin size="small"/>
                        )}
                        {resolvedTotalCount !== undefined && typeof resolvedTotalCount === 'number' && resolvedTotalCount > parts.length && (
                            <Typography.Text type="secondary" style={{fontSize: 12}}>
                                Еще {((resolvedTotalCount - parts.length).toLocaleString('ru-RU'))} записей
                            </Typography.Text>
                        )}
                    </Flex>
                )}
            </>
        )
    }
    //--------для PartsHeader
    const handleReload = () => {
        refetchParts()
    }

    const onAdd = () => {
        setModalOpen(true)
    }
    //-----для PartsSearch
    const onCodeFilterModeChange = (value: CodeFilterMode) => {
        setCodeFilterMode(value)
        // Не сбрасываем поиск, пересчет произойдет автоматически через useMemo
    }

    const onSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target
        setSearchInput(value)
        // Поиск происходит динамически через useEffect для обоих режимов
        // Для режима "without_producer" с debounce, для "by_producer" сразу
        if (!value) {
            setSearch('')
        }
    }

    const onSearch = (value: string) => {
        // При нажатии Enter или кнопки поиска сразу применяем фильтр
        setSearch(value.trim())
        setSearchInput(value.trim())
    }

    return (

        <Flex vertical gap={8} style={{height: '100%'}} className="panel">
            <PartsHeader searchType={searchType}
                         countLabel={countLabel}
                         isFetching={isFetching}
                         onReload={handleReload}
                         onAdd={onAdd}
                         producer={producer}
            />
            <PartsSearch searchType={searchType}
                         codeFilterMode={codeFilterMode}
                         searchInput={searchInput}
                         onSearchInputChange={(event) => onSearchInputChange(event)}
                         onSearch={(value) => onSearch(value)}
                         onSearchSelectTypeChange={(value) => handleSearchTypeChange(value)}
                         onCodeFilterModeChange={onCodeFilterModeChange}
                         producer={producer}
            />


            <div className="panel-body" ref={tableContainerRef}>
                {renderBody()}
            </div>

            {contextMenu && (
                <PartsContextMenu
                    actions={partsActionsMap.get(contextMenu.partId) || []}
                    position={contextMenu}
                    onClose={() => setContextMenu(null)}
                />
            )}

            <PartDetailsDrawer producer={producer} part={previewPart} onClose={() => setPreviewPart(null)}/>

            <PartFormModal
                open={isModalOpen}
                mode={editingPart ? 'edit' : 'create'}
                initialValues={editingPart ?? {Rating: 0}}
                loading={createMutation.isPending || updateMutation.isPending}
                onCancel={closeModal}
                onSubmit={handleSubmit}
                brand={producer?.Name}
            />
        </Flex>
    )
}

