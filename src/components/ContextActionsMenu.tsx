import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'

export interface ContextAction {
  key: string
  label: ReactNode
  onClick: () => void
  danger?: boolean
}

interface ContextActionsMenuProps {
  actions: ContextAction[]
  children: ReactNode
}

export const ContextActionsMenu = ({ actions, children }: ContextActionsMenuProps) => {
  const items: MenuProps['items'] = actions.map((action) => ({
    key: action.key,
    label: action.label,
    onClick: (info) => {
      info.domEvent.stopPropagation()
      action.onClick()
    },
    danger: action.danger,
  }))

  return (
    <Dropdown trigger={['contextMenu']} menu={{ items }}>
      <div>{children}</div>
    </Dropdown>
  )
}

