import { useMemo } from 'react'
import { Space } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { EtPart } from '../../../api/types.ts'
import type {ContextMenuAction} from '../components/PartsContextMenu.tsx';


interface UsePartsActionsMapProps {
    filteredParts: EtPart[]
    onEdit: (part: EtPart) => void
    onDelete: (part: EtPart) => void
}

export const usePartsActionsMap = ({
                                       filteredParts,
                                       onEdit,
                                       onDelete,
                                   }: UsePartsActionsMapProps): Map<number, ContextMenuAction[]> => {
    return useMemo(() => {
        const map = new Map<number, ContextMenuAction[]>()

        filteredParts.forEach((part) => {
            map.set(part.Id, [
                {
                    key: 'edit',
                    label: (
                        <Space size={6}>
                            <EditOutlined />
                            Редактировать
                        </Space>
                    ),
                    onClick: () => onEdit(part),
                },
                {
                    key: 'delete',
                    label: (
                        <Space size={6}>
                            <DeleteOutlined />
                            Удалить
                        </Space>
                    ),
                    danger: true,
                    onClick: () => onDelete(part),
                },
            ])
        })

        return map
    }, [filteredParts, onEdit, onDelete])
}