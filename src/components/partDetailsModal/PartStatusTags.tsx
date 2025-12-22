import { Space, Tag } from 'antd'

interface PartStatusTagsProps {
    accepted?: boolean
    noChangeFlag?: boolean
    deleted?: boolean
    old?: boolean
    dead?: boolean
}

const booleanLabel = (value?: boolean) => (value ? 'Да' : 'Нет')

export const PartStatusTags = ({
                                   accepted,
                                   noChangeFlag,
                                   deleted,
                                   old,
                                   dead,
                               }: PartStatusTagsProps) => {
    const tags = [
        accepted ? { label: 'Принято', color: 'green' } : null,
        { label: `Изменения: ${booleanLabel(noChangeFlag)}`, color: noChangeFlag ? 'blue' : undefined },
        { label: `Удалено: ${booleanLabel(deleted)}`, color: deleted ? 'red' : undefined },
        { label: `Старое: ${booleanLabel(old)}`, color: old ? 'orange' : undefined },
        { label: `Снят: ${booleanLabel(dead)}`, color: dead ? 'purple' : undefined },
    ].filter(Boolean) as { label: string; color?: string }[]


    return (
        <Space wrap size="small">
            {tags.map((tag, index) => (
                <Tag key={index} color={tag.color}>
                    {tag.label}
                </Tag>
            ))}
        </Space>
    )
}
