import { useState, useEffect, useRef } from 'react'
import type {CodeFilterMode} from '../PartsPanel.tsx';
import type {SearchType} from '../../../config/resources.ts';

const PARTS_FILTER_SESSION_KEY = 'partsPanelFilters'

interface PartsFilterSettings {
    searchInput: string
    search: string
    searchType: SearchType
    codeFilterMode: CodeFilterMode
}

const loadPartsFilterSettings = (): PartsFilterSettings | null => {
    if (typeof window === 'undefined') {
        return null
    }
    try {
        const raw = window.sessionStorage.getItem(PARTS_FILTER_SESSION_KEY)
        return raw ? (JSON.parse(raw) as PartsFilterSettings) : null
    } catch {
        return null
    }
}

interface UsePartsFilterProps {
    initialSearch?: string
    initialSearchType?: SearchType
    onSearchTypeChange?: (type: SearchType) => void
}

export const usePartsFilter = ({
                                   initialSearch,
                                   initialSearchType,
                                   onSearchTypeChange,
                               }: UsePartsFilterProps) => {
    const savedFilters = loadPartsFilterSettings()

    const [searchInput, setSearchInput] = useState(() =>
        initialSearch ?? savedFilters?.searchInput ?? ''
    )
    const [search, setSearch] = useState(() =>
        initialSearch ?? savedFilters?.search ?? ''
    )
    const [searchType, setSearchType] = useState<SearchType>(() =>
        initialSearchType ?? savedFilters?.searchType ?? 'by_producer'
    )
    const [codeFilterMode, setCodeFilterMode] = useState<CodeFilterMode>(() =>
        savedFilters?.codeFilterMode ?? 'startsWith'
    )

    // Синхронизация с initialSearch и initialSearchType (только при первом рендере или изменении)
    const initialSearchProcessedRef = useRef(false)
    const initialSearchTypeProcessedRef = useRef(false)

    useEffect(() => {
        if (initialSearch !== undefined && !initialSearchProcessedRef.current) {
            setSearchInput(initialSearch)
            setSearch(initialSearch)
            initialSearchProcessedRef.current = true
        }
    }, [initialSearch])

    useEffect(() => {
        if (initialSearchType !== undefined && !initialSearchTypeProcessedRef.current) {
            setSearchType(initialSearchType)
            onSearchTypeChange?.(initialSearchType)
            initialSearchTypeProcessedRef.current = true
        }
    }, [initialSearchType, onSearchTypeChange])

    // Динамический поиск при вводе для обоих режимов с debounce
    useEffect(() => {
        // Для режима "without_producer" добавляем debounce, чтобы не делать запрос при каждом символе
        if (searchType === 'without_producer') {
            const timer = setTimeout(() => {
                setSearch(searchInput.trim())
            }, 500) // Задержка 500мс

            return () => clearTimeout(timer)
        } else if (searchType === 'by_producer') {
            // Для режима "by_producer" поиск происходит сразу (фильтрация на клиенте)
            setSearch(searchInput.trim())
        }
    }, [searchInput, searchType])

    // Сохранение фильтров в sessionStorage
    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        const payload: PartsFilterSettings = {
            searchInput,
            search,
            searchType,
            codeFilterMode,
        }
        window.sessionStorage.setItem(PARTS_FILTER_SESSION_KEY, JSON.stringify(payload))
    }, [searchInput, search, searchType, codeFilterMode])

    // Оповещение об изменении типа поиска
    useEffect(() => {
        onSearchTypeChange?.(searchType)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchType])

    const handleSearchTypeChange = (newType: SearchType) => {
        setSearchType(newType)
        setSearch('')
        setSearchInput('')
    }

    return {
        searchInput,
        search,
        searchType,
        codeFilterMode,
        setSearchInput,
        setSearch,
        setCodeFilterMode,
        handleSearchTypeChange,
    }
}