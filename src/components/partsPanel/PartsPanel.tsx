import {useEffect, useRef, useState, type MouseEvent, type ChangeEvent} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Empty, Flex, message, Modal} from 'antd'
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
import {usePartsActionsMap} from './usePartsActionsMap.tsx';
import {usePartsFilter} from './usePartsFilter.tsx';
import {usePartsData} from './usePartsData.ts';
import {usePartsTable} from './usePartsTable.tsx';
import {PartsTable} from './PartsTable.tsx';

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
    const queryClient = useQueryClient()

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

    const {columns} = usePartsTable({
        searchType,
        producersMap,
        stringsMap,
        isStringsFetching,
        handleCopy,
        handleProducerFilter: onFocusProducer ? handleProducerFilter : undefined
    })

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

            {searchType === 'by_producer' && !producer ? (
                <div className="panel-body">
                    <Empty description="Выберите производителя"/>
                </div>
            ) : searchType === 'without_producer' && !search?.trim() ? (
                <div className="panel-body">
                    <Empty description="Введите код для поиска"/>
                </div>
            ) : (
                <PartsTable
                    parts={parts}
                    filteredParts={filteredParts}
                    columns={columns}
                    selectedPart={selectedPart}
                    onSelectPart={onSelectPart}
                    partsActionsMap={partsActionsMap}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    resolvedTotalCount={resolvedTotalCount}
                    fetchNextPage={fetchNextPage}
                    containerRef={tableContainerRef}
                    trimmedSearch={trimmedSearch}
                    initialLoading={initialLoading}
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

