import {type ReactNode, useEffect, useMemo} from 'react'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'

export interface ContextMenuAction {
    key: string
    label: ReactNode
    onClick: () => void
    danger?: boolean
}

export interface ContextMenuPosition {
    partId: number
    x: number
    y: number
}

type Props = {
    position: ContextMenuPosition
    actions: ContextMenuAction[]
    onClose: () => void
}

export const PartsContextMenu = ({
                                     position,
                                     actions,
                                     onClose,
                                 }: Props) => {
    // Закрываем контекстное меню при клике вне его
    useEffect(() => {
        if (!position) {
            return
        }

        const handleClick = () => {
            onClose()
        }

        const handleContextMenu = () => {
            onClose()
        }

        // Небольшая задержка, чтобы не закрыть меню сразу после открытия
        const timeout = setTimeout(() => {
            document.addEventListener('click', handleClick)
            document.addEventListener('contextmenu', handleContextMenu)
        }, 100)

        return () => {
            clearTimeout(timeout)
            document.removeEventListener('click', handleClick)
            document.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [position, onClose])

    const menuItems: MenuProps['items'] = useMemo(()=> actions.map((action) => ({
        key: action.key,
        label: action.label,
        onClick: (info) => {
            info.domEvent.stopPropagation()
            info.domEvent.preventDefault()
            action.onClick()
            onClose()
        },
        danger: action.danger,
    })))

    return (
        <Dropdown
            open={true}
            menu={{ items: menuItems }}
            trigger={['contextMenu']}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
            getPopupContainer={() => document.body}
        >
            <div
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    width: 1,
                    height: 1,
                    pointerEvents: 'none',
                }}
            />
        </Dropdown>
    )
}