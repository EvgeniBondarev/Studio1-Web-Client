import {type MouseEvent} from 'react'
import type {ColumnsType} from 'antd/es/table'
import {Typography, Spin} from 'antd'
import type {EtPart} from '../../../api/types.ts'

interface UsePartsTableProps {
    stringsMap: Record<number, string>
    isStringsFetching: boolean
    handleCopy: (event: MouseEvent<HTMLElement>, value?: string | null) => void
}

export const usePartsTable = ({
                                  stringsMap,
                                  isStringsFetching,
                                  handleCopy,
                              }: UsePartsTableProps) => {
    // Функция для обрезки текста до 65 символов
    const truncateText = (text: string): string => {
        if (text.length <= 65) return text
        return text.substring(0, 65) + '...'
    }

    const getStringValue = (id?: number) => (id ? stringsMap[id] : undefined);

    const renderStringValue = (id?: number) => {
        if (!id) return '—'

        if (stringsMap) {
            const text = stringsMap[id]
            if (text !== undefined) {
                if (!text) return '—'

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
                if (!value) return '-'
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
        {
            title: 'Лп. код',
            dataIndex: 'LongCode',
            sorter: {
                compare: (a, b) => compareStrings(a.LongCode, b.LongCode),
                multiple: 5,
            },
            sortDirections: ['ascend', 'descend'],
            render: (value?: string) => {
                if (!value) return '—'
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
                multiple: 4,
            },
            sortDirections: ['ascend', 'descend'],
            render: (_, record) => renderStringValue(record.Name),
        },
        {
            title: 'Описание',
            dataIndex: 'Description',
            sorter: {
                compare: (a, b) => compareStringIds(a.Description, b.Description),
                multiple: 3,
            },
            sortDirections: ['ascend', 'descend'],
            render: (_, record) => renderStringValue(record.Description),
        },
        {
            title: 'Вес',
            dataIndex: 'Weight',
            sorter: {
                compare: (a, b) => compareNumbers(a.Weight, b.Weight),
                multiple: 1,
            },
            sortDirections: ['ascend', 'descend'],
            render: (value?: number) => (value ? `${value.toFixed(2)}` : '—'),
        },
    ]

    return {
        columns,
        truncateText,
        renderStringValue,
        compareStrings,
        compareNumbers,
        compareStringIds
    }
}