import {type DataNode} from 'antd/es/tree';
import {ContextActionsMenu} from '../ContextActionsMenu.tsx'
import {InfoCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons'
import {Space} from 'antd'
import {type TreeNode} from '../../api/crossCode.ts';

type Props = {
  // producer actions
  onProducerView: (id: number) => void
  onProducerEdit: (id: number) => void
  onProducerDelete: (producer: any) => void
  getProducerDisplayName: (producer?: any) => string

  // part actions
  onPartView: (code: string) => void
  onPartEdit: (code: string) => void
  onPartDeleteByCode: (code: string) => void

  // utils
  formatDate: (date?: string) => string | null
}

export function createCrossTreeMapper(deps: Props) {
  const {
    onProducerView,
    onProducerEdit,
    onProducerDelete,
    getProducerDisplayName,
    onPartView,
    onPartEdit,
    onPartDeleteByCode,
    formatDate,
  } = deps

  function mapNodeToTreeData(node: TreeNode, path = ''): DataNode {

  if (node.type === 'producer') {
    const key = `${path}-producer-${node.cross}`

    return {
      key,
      title: (
        <ContextActionsMenu
          actions={node.producer ? [
            {
              key: 'view',
              label: <Space size={6}><InfoCircleOutlined/>Просмотр</Space>,
              onClick: () => onProducerView(node.producer!.Id),
            },
            {
              key: 'edit',
              label: <Space size={6}><EditOutlined/>Редактировать</Space>,
              onClick: () => onProducerEdit(node.producer!.Id),
            },
            {
              key: 'delete',
              label: <Space size={6}><DeleteOutlined/>Удалить</Space>,
              danger: true,
              onClick: () => onProducerDelete(node.producer!),
            },
          ] : []}
        >
          <span className="cross-tree-brand-row">
            {getProducerDisplayName(node.producer)}
          </span>
        </ContextActionsMenu>
      ),
      children: node.children.map(child =>
        mapNodeToTreeData(child, key)
      ),
    }
  }

  const key = `${path}-code-${node.id}`

  return {
    key,
    title: (
      <ContextActionsMenu
        actions={[
          {
            key: 'view',
            label: <Space size={6}><InfoCircleOutlined/>Просмотр</Space>,
            onClick: () => onPartView(node.code),
          },
          {
            key: 'edit',
            label: <Space size={6}><EditOutlined/>Редактировать</Space>,
            onClick: () => onPartEdit(node.code),
          },
          {
            key: 'delete',
            label: <Space size={6}><DeleteOutlined/>Удалить</Space>,
            danger: true,
            onClick: () => onPartDeleteByCode(node.code),
          },
        ]}
      >
        <div className="cross-tree-code-row">
          <span className="cross-tree-code-row__code">{node.code}</span>
          <span className="cross-tree-code-row__verity">
            {node.verity}%({node.verity}%)
          </span>
          <span className="cross-tree-code-row__date">
            {formatDate(node.date) ?? '—'}
          </span>
        </div>
      </ContextActionsMenu>
    ),
    children: node.children.map(child =>
      mapNodeToTreeData(child, key)
    ),
  }
}   return mapNodeToTreeData
}