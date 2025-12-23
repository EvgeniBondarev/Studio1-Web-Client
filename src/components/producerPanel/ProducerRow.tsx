import * as React from 'react'
import {Space, Typography} from 'antd'
import {LinkOutlined, QuestionCircleOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons'
import {ContextActionsMenu} from '../ContextActionsMenu.tsx'
import type {EtProducer} from '../../api/types.ts';

interface ProducerRowProps {
    producer: EtProducer
    isSelected: boolean
    isActive: boolean
    prefix: string
    prefixFrequency: number
    partsCountInfo?: {
        value?: number
        isLoading: boolean
    }
    onRowClick: (producer: EtProducer, event: React.MouseEvent<HTMLDivElement>) => void
    onView: (producer: EtProducer) => void
    onEdit: (producer: EtProducer) => void
    onDelete: (producer: EtProducer) => void
}


export const renderRatingBadge = (rating?: number | null) => {
    if (rating === undefined || rating === null || rating < 0) {
        return (
            <span className="producer-rating producer-rating--unknown" title="Статус не задан">
          <QuestionCircleOutlined style={{fontSize: 11}}/>
            </span>
        )
    }
    const clamped = Math.max(0, Math.min(10, rating))
    const level = clamped >= 7 ? 'high' : clamped >= 4 ? 'medium' : 'low'
    return (
        <span className={`producer-rating producer-rating--${level}`} title={`Рейтинг: ${clamped}`}>
        {Number.isInteger(clamped) ? clamped : clamped.toFixed(1)}
        </span>
    )
}

export const ProducerRow = React.memo(({
                                producer,
                                isSelected,
                                isActive,
                                prefixFrequency,
                                prefix,
                                partsCountInfo,
                                onRowClick,
                                onView,
                                onEdit,
                                onDelete,
                            }: ProducerRowProps) => {

    const isNonOriginal = producer.RealId != null && producer.RealId !== producer.Id

    const actions = [
        {
            key: 'view',
            label: (
                <Space size={6}>
                    <InfoCircleOutlined/>
                    Просмотр
                </Space>
            ),
            onClick: ()=>onView(producer),
        },
        {
            key: 'edit',
            label: (
                <Space size={6}>
                    <EditOutlined/>
                    Редактировать
                </Space>
            ),
            onClick: ()=>onEdit(producer) ,
        },
        {
            key: 'delete',
            label: (
                <Space size={6}>
                    <DeleteOutlined/>
                    Удалить
                </Space>
            ),
            danger: true,
            onClick: ()=>onDelete(producer) ,
        },
    ]

    const rowClassNames = ['producer-row']
    if (isActive) rowClassNames.push('producer-row--active')
    if (isSelected) rowClassNames.push('producer-row--selected')

    const renderPartsCount = () => {
        if (!partsCountInfo) return '—'
        if (partsCountInfo.isLoading && partsCountInfo.value === undefined) return '…'
        return partsCountInfo.value?.toLocaleString('ru-RU') ?? '—'
    }
    return (
        <ContextActionsMenu actions={actions}>
            <div
                className="producer-row-wrapper"
                style={{padding: 0}}
                onClick={(e) => onRowClick(producer, e)}
            >
                <div className={rowClassNames.join(' ')}>
                    <Typography.Text
                        className="producer-row__cell producer-row__cell--prefix"
                        strong
                        title={prefix || '—'}
                    >
            <span className="producer-prefix">
              {renderRatingBadge(producer.Rating)}
                <span>
                {prefix || '—'}
                    {prefix && prefix !== '—' && prefixFrequency >= 2 && (
                        <Typography.Text type="secondary" style={{fontSize: 11, marginLeft: 4}}>
                            ({prefixFrequency})
                        </Typography.Text>
                    )}
              </span>
            </span>
                    </Typography.Text>
                    <Typography.Text
                        className="producer-row__cell producer-row__cell--name"
                        title={producer.Name ?? '—'}
                    >
                        <Space size={4}>
                            {producer.Name ?? '—'}
                            {isNonOriginal && (
                                <LinkOutlined style={{fontSize: 12, color: '#1890ff'}}/>
                            )}
                        </Space>
                    </Typography.Text>
                    <Typography.Text
                        className="producer-row__cell producer-row__cell--count"
                        title={
                            partsCountInfo?.value !== undefined
                                ? String(partsCountInfo.value)
                                : undefined
                        }
                    >
                        {renderPartsCount()}
                    </Typography.Text>
                </div>
            </div>
        </ContextActionsMenu>
    )
})