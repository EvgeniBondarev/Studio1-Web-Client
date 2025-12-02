import { Alert, Button, Descriptions, Drawer, Space, Tag, Typography } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import type { EtProducer } from '../api/types.ts'

interface ProducerDetailsDrawerProps {
  producer?: EtProducer | null
  onClose: () => void
  onSelectProducer?: (producerId: number) => void
}

export const ProducerDetailsDrawer = ({ producer, onClose, onSelectProducer }: ProducerDetailsDrawerProps) => {
  const isNonOriginal = producer && producer.RealId !== undefined && producer.RealId !== null && producer.RealId !== producer.Id

  return (
    <Drawer
      title="Информация о производителе"
      placement="right"
      size="large"
      open={Boolean(producer)}
      onClose={onClose}
      destroyOnHidden
    >
      {producer ? (
        <>
          <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {producer.Name ?? 'Без названия'}
            </Typography.Title>
            {isNonOriginal && (
              <Alert
                message={
                  <Space>
                    <Tag color="orange">Не оригинальный производитель</Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Это альтернативное название производителя
                    </Typography.Text>
                  </Space>
                }
                description={
                  onSelectProducer && (
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      size="small"
                      style={{ padding: 0, height: 'auto', marginTop: 8 }}
                      onClick={() => {
                        onSelectProducer(producer.RealId!)
                        onClose()
                      }}
                    >
                      Перейти к основному производителю (ID: {producer.RealId})
                    </Button>
                  )
                }
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Space>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="ID">{producer.Id}</Descriptions.Item>
            <Descriptions.Item label="RealId">
              {producer.RealId ?? '—'}
              {isNonOriginal && producer.RealId && (
                <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  (основной производитель)
                </Typography.Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Префикс">{producer.Prefix ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Рыночный префикс">{producer.MarketPrefix ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Рейтинг">{producer.Rating ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Домен">{producer.Domain ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Сайт">{producer.Www ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Адрес">{producer.Address ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="TecDoc ID">{producer.TecdocSupplierId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Exist ID">{producer.ExistId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Exist Name">{producer.ExistName ?? '—'}</Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <Typography.Text type="secondary">Выберите производителя для просмотра информации</Typography.Text>
      )}
    </Drawer>
  )
}

