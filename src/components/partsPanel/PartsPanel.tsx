import {useEffect, useMemo, useRef, useState, type ChangeEvent} from 'react'
import {Empty, Flex} from 'antd'
import type {EtPart, EtProducer} from '../../api/types.ts';
import {PartDetailsModal} from '../partDetailsModal';
import {PartsHeader} from './components/PartsHeader.tsx';
import {PartsSearch} from './components/PartsSearch.tsx';
import {usePartsActionsMap} from './hooks/usePartsActionsMap.tsx';
import {usePartsFilter} from './hooks/usePartsFilter.tsx';
import {usePartsData} from './hooks/usePartsData.ts';
import {usePartsTable} from './hooks/usePartsTable.tsx';
import {PartsTable} from './components/PartsTable.tsx';
import {usePartFormModal} from './hooks/usePartFormModal.ts';
import {useCopyToClipboard} from './hooks/useCopyToClipboard.ts';
import {useCountLabel} from './hooks/useCountLabel.ts';
import {useSearchNormalization} from './hooks/useSearchNormalization.ts';
import type {SearchType} from '../../config/resources.ts';
import {PartFormModal} from './components/PartFormModal.tsx';

export type CodeFilterMode = 'exact' | 'startsWith' | 'endsWith' | 'contains'

interface PartsPanelProps {
    producer?: EtProducer | null
    onSelectPart: (part: EtPart | null) => void
    selectedPart?: EtPart | null
    onSearchTypeChange?: (type: SearchType) => void
    onProducerIdsChange?: (producerIds: number[]) => void
    autoEditPart?: EtPart | null
    onAutoEditProcessed?: () => void
    initialSearch?: string
    initialSearchType?: SearchType
}

export const PartsPanel = ({
                               producer,
                               onSelectPart,
                               selectedPart,
                               onSearchTypeChange,
                               onProducerIdsChange,
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

    const [previewPart, setPreviewPart] = useState<EtPart | null>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)

    const { processSearchTerm } = useSearchNormalization()
    const { trimmedSearch, rawSearchTerm, normalizedSearchTerm } = processSearchTerm(search)

    const {
        parts,
        filteredParts,
        totalParts,
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

    const {countLabel, resolvedTotalCount} = useCountLabel({
        searchType,
        trimmedSearch,
        producer,
        filteredParts,
        parts,
        totalParts,
    });

    const initialLoading = isLoading && !parts.length

    const {handleCopy} = useCopyToClipboard();

    const {
        isModalOpen,
        editingPart,
        openModal,
        closeModal,
        handleSubmit,
        confirmDelete,
        isSubmitting,
        modalMode,
    } = usePartFormModal(producer, autoEditPart, onAutoEditProcessed, selectedPart, onSelectPart)

    const {columns} = usePartsTable({
        stringsMap,
        isStringsFetching,
        handleCopy,
    })

    // Создаем маппинг actions для каждой детали
    const partsActionsMap = usePartsActionsMap({
        filteredParts,
        onView: (part) => setPreviewPart(part),
        onEdit: (part) => {
            openModal(part)
        },
        onDelete: (part) => confirmDelete(part),
    })

    const handleReload = () => {
        refetchParts()
    }

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

    // Извлекаем ProducerId из найденных деталей при поиске без производителя
    const producerIdsFromParts = useMemo(() => {
        if (searchType === 'without_producer' && parts.length > 0) {
            const ids = Array.from(
                new Set(parts.map((part) => part.ProducerId).filter((id): id is number => typeof id === 'number'))
            ).sort((a, b) => a - b) // Сортируем для стабильного сравнения
            return ids
        }
        return []
    }, [parts, searchType])

    // Передаем ProducerId в родительский компонент
    const prevProducerIdsRef = useRef<number[]>([])
    useEffect(() => {
        // Сравниваем массивы глубоко, чтобы избежать лишних вызовов
        const idsChanged = producerIdsFromParts.length !== prevProducerIdsRef.current.length ||
            producerIdsFromParts.some((id, index) => id !== prevProducerIdsRef.current[index])
        
        if (idsChanged && onProducerIdsChange) {
            prevProducerIdsRef.current = producerIdsFromParts
            onProducerIdsChange(producerIdsFromParts)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [producerIdsFromParts])

    useEffect(() => {
        tableContainerRef.current?.scrollTo({top: 0})
    }, [producer?.Id])

    return (

        <Flex vertical gap={8} style={{height: '100%'}} className="panel">
            <PartsHeader searchType={searchType}
                         countLabel={countLabel}
                         isFetching={isFetching}
                         onReload={handleReload}
                         onAdd={() => openModal()}
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

            <PartDetailsModal producer={producer} part={previewPart} onClose={() => setPreviewPart(null)}/>

            <PartFormModal
                open={isModalOpen}
                mode={modalMode}
                initialValues={editingPart ?? {Rating: 0}}
                loading={isSubmitting}
                onCancel={closeModal}
                onSubmit={handleSubmit}
                brand={producer?.Name}
            />
        </Flex>
    )
}

