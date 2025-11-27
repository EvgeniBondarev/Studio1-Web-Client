import { Descriptions, Divider, Drawer, Space, Tag, Typography } from 'antd'
import type { EtPart, EtProducer } from '../api/types.ts'

interface PartDetailsDrawerProps {
  producer?: EtProducer | null
  part?: EtPart | null
  onClose: () => void
}

const booleanLabel = (value?: boolean) => (value ? 'Да' : 'Нет')

export const PartDetailsDrawer = ({ producer, part, onClose }: PartDetailsDrawerProps) => {
  return (
    <Drawer
      title="Карточка детали"
      placement="right"
      open={Boolean(part)}
      onClose={onClose}
      size="large"
      destroyOnClose
    >
      {part ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Typography.Text type="secondary">Производитель</Typography.Text>
            <Typography.Title level={5} style={{ marginTop: 4 }}>
              {producer?.Name ?? producer?.Prefix ?? 'Неизвестно'}
            </Typography.Title>
          </div>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Код">{part.Code ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Длинный код">{part.LongCode ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Вес">{part.Weight ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Сессия">{part.SessionId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Идентификатор имени">{part.Name ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Идентификатор описания">
              {part.Description ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Объём">{part.V ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Старый ID">{part.OldId ?? '—'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Space wrap size="small">
            {part.Accepted && <Tag color="green">Принято</Tag>}
            <Tag color={part.NoChangeFlag ? 'blue' : undefined}>
              Изменения: {booleanLabel(part.NoChangeFlag)}
            </Tag>
            <Tag color={part.Deleted ? 'red' : undefined}>Удалено: {booleanLabel(part.Deleted)}</Tag>
            <Tag color={part.Old ? 'orange' : undefined}>Старое: {booleanLabel(part.Old)}</Tag>
            <Tag color={part.Dead ? 'purple' : undefined}>Снят: {booleanLabel(part.Dead)}</Tag>
          </Space>
        </Space>
      ) : (
        <Typography.Text type="secondary">Выберите деталь для просмотра информации</Typography.Text>
      )}
    </Drawer>
  )
}

