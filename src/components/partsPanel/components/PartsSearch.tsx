import { Input, Select, Space } from 'antd'
import type { EtProducer } from '../../../api/types.ts'
import type {CodeFilterMode, SearchType} from '../PartsPanel.tsx';
import type {ChangeEvent} from 'react';

interface PartsSearchProps {
    searchType: SearchType
    codeFilterMode: CodeFilterMode
    producer?: EtProducer | null
    searchInput: string
    onSearchInputChange: (value: ChangeEvent<HTMLInputElement>) => void
    onSearch: (value: string) => void
    onSearchSelectTypeChange: (value: SearchType) => void
    onCodeFilterModeChange: (value: CodeFilterMode) => void
}

 interface CodeFilterOption {
    value: CodeFilterMode
    label: string
}
const FILTER_OPTIONS: CodeFilterOption[] = [
    { value: 'exact', label: 'Точное совпадение' },
    { value: 'startsWith', label: 'Начинается с' },
    { value: 'endsWith', label: 'Заканчивается на' },
    { value: 'contains', label: 'Содержит' },
]

export interface SearchTypeOption {
    value: SearchType
    label: string
}

 const SEARCH_TYPE_OPTIONS:SearchTypeOption[] = [
    { value: 'by_producer', label: 'По производителю' },
    { value: 'without_producer', label: 'Без учета производителя' },
]

export const PartsSearch = ({
                                searchType,
                                codeFilterMode,
                                producer,
                                searchInput,
                                onSearchInputChange,
                                onSearch,
                                onSearchSelectTypeChange,
                                onCodeFilterModeChange
                            }: PartsSearchProps) => {

    return (
        <div style={{ position: 'relative' }}>
            <Space.Compact style={{ width: '100%' }} className="panel-search">
                {searchType === 'by_producer' && (
                    <Select
                        value={codeFilterMode}
                        onChange={onCodeFilterModeChange}
                        size="small"
                        style={{ width: 170 }}
                        options={FILTER_OPTIONS}
                    />
                )}
                <Input.Search
                    placeholder="Поиск по коду"
                    allowClear
                    size="small"
                    value={searchInput}
                    onChange={onSearchInputChange}
                    onSearch={onSearch}
                    disabled={searchType === 'by_producer' && !producer}
                    style={{ flex: 1 }}
                />
                <Select
                    value={searchType}
                    onChange={onSearchSelectTypeChange}
                    size="small"
                    style={{ width: 180 }}
                    options={SEARCH_TYPE_OPTIONS}
                />
            </Space.Compact>
        </div>
    )
}