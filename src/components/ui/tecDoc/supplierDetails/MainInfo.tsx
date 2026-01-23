import { Row, Col, Typography, Tag, Space } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import React from 'react';

const { Text } = Typography

interface Props {
  id: number
  nbrOfArticles?: number
  dataVersion?: number | string
  hasNewVersionArticles?: boolean
}

export function MainInfo({
                           id,
                           hasNewVersionArticles,
                           nbrOfArticles,
                           dataVersion
                         }: Props) {

  const InfoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Space orientation="vertical" size={2}>
      <Text type="secondary">{label}</Text>
      {children}
    </Space>
  )

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={12}>
        <InfoItem label="ID поставщика:">
          <Text strong style={{ fontSize: 18 }}>
            {id}
          </Text>
        </InfoItem>
      </Col>

      {nbrOfArticles !== undefined && (
        <Col xs={24} md={12}>
          <InfoItem label="Количество артикулов:">
            <Space>
              <InboxOutlined style={{ color: '#2563eb' }} />
              <Text strong style={{ fontSize: 18 }}>
                {nbrOfArticles.toLocaleString()}
              </Text>
            </Space>
          </InfoItem>
        </Col>
      )}

      {dataVersion !== undefined && (
        <Col xs={24} md={12}>
          <InfoItem label="Версия данных:">
            <Text strong style={{ fontSize: 18 }}>
              {dataVersion}
            </Text>
          </InfoItem>
        </Col>
      )}

      {hasNewVersionArticles && (
        <Col xs={24} md={12}>
          <InfoItem label="Статус:">
            <Tag color="green">Есть новые версии артикулов</Tag>
          </InfoItem>
        </Col>
      )}
    </Row>
  )
}