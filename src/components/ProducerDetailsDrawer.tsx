import { Descriptions, Drawer, Typography } from 'antd'
import type { EtProducer } from '../api/types.ts'

interface ProducerDetailsDrawerProps {
  producer?: EtProducer | null
  onClose: () => void
}

export const ProducerDetailsDrawer = ({ producer, onClose }: ProducerDetailsDrawerProps) => {
  return (
    <Drawer
      title="Информация о производителе"
      placement="right"
      size="large"
      open={Boolean(producer)}
      onClose={onClose}
      destroyOnClose
    >
      {producer ? (
        <>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            {producer.Name ?? 'Без названия'}
          </Typography.Title>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="ID">{producer.Id}</Descriptions.Item>
            <Descriptions.Item label="RealId">{producer.RealId ?? '—'}</Descriptions.Item>
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

