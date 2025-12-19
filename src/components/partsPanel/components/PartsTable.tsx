import {type MouseEvent, useEffect, useRef, useState} from 'react'
import {Empty, Flex, Spin, Table, Typography} from 'antd'
import type {EtPart} from '../../../api/types.ts'
import {type ContextMenuAction, type ContextMenuPosition, PartsContextMenu} from './PartsContextMenu.tsx'

interface PartsTableProps {
    parts: EtPart[]
    filteredParts: EtPart[]
    columns: any[]
    selectedPart?: EtPart | null
    onSelectPart: (part: EtPart | null) => void
    partsActionsMap: Map<number, ContextMenuAction[]>
    hasNextPage: boolean
    isFetchingNextPage: boolean
    resolvedTotalCount?: number
    fetchNextPage: () => void
    containerRef?: React.RefObject<HTMLDivElement | null>
    trimmedSearch: string
    initialLoading: boolean
}

export const PartsTable = ({
                               parts,
                               filteredParts,
                               columns,
                               selectedPart,
                               onSelectPart,
                               partsActionsMap,
                               hasNextPage,
                               isFetchingNextPage,
                               resolvedTotalCount,
                               fetchNextPage,
                               containerRef,
                               trimmedSearch,
                               initialLoading,
                           }: PartsTableProps) => {
    const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

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

    const renderBody = () => {
        if (initialLoading) {
            return (
                <Flex justify="center" align="center" style={{ minHeight: 200 }}>
                    <Spin />
                </Flex>
            )
        }

        return filteredParts.length ? (
            <>
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
                {(hasNextPage || isFetchingNextPage) && (
                    <Flex
                        ref={loadMoreRef}
                        vertical
                        align="center"
                        style={{padding: 12}}
                        gap={4}
                    >
                        {isFetchingNextPage && <Spin size="small"/>}
                        {resolvedTotalCount !== undefined && typeof resolvedTotalCount === 'number' && resolvedTotalCount > parts.length && (
                            <Typography.Text type="secondary" style={{fontSize: 12}}>
                                Еще {(resolvedTotalCount - parts.length).toLocaleString('ru-RU')} записей
                            </Typography.Text>
                        )}
                    </Flex>
                )}
            </>
        ) : (
            <Empty description={trimmedSearch ? 'Ничего не найдено' : 'Пока нет деталей'}/>
        )
    }

    return (
        <>
            <div className="panel-body" ref={containerRef}>
                {renderBody()}
            </div>

            {contextMenu && (
                <PartsContextMenu
                    actions={partsActionsMap.get(contextMenu.partId) || []}
                    position={contextMenu}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </>
    )
}