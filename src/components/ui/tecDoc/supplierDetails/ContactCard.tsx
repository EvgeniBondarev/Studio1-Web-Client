import { Card, Row, Col, Typography, Space, Divider } from 'antd'
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import type { SupplierDetailDto } from '../../../../api/TecDoc/api/services/supplier.service.ts';

const { Title, Text } = Typography

type Props = {
  detail: SupplierDetailDto
  index: number
}

export const ContactCard = ({
                              detail,
                              index,
                            }: Props) => {
  return (
    <Card
      styles={{ body: { padding: 16 } }}
      style={{ backgroundColor: '#f9fafb' }}
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        {/* Заголовок */}
        <Title
          level={5}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: 0,
          }}
        >
          <EnvironmentOutlined />
          {detail.addressType || `Адрес ${index + 1}`}
          {detail.addressTypeId && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              (ID: {detail.addressTypeId})
            </Text>
          )}
        </Title>

        {/* Основная информация */}
        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          {(detail.name1 || detail.name2) && (
            <div>
              <Text type="secondary">Название:</Text>
              <br />
              <Text strong>
                {detail.name1}
                {detail.name2 && ` ${detail.name2}`}
              </Text>
            </div>
          )}

          {(detail.street1 || detail.street2 || detail.city1 || detail.postalCodeCity) && (
            <div>
              <Text type="secondary">Адрес:</Text>
              <br />
              <Text strong>
                {detail.street1}
                {detail.street2 && `, ${detail.street2}`}
                <br />
                {detail.postalCodeCity} {detail.city1}
                {detail.city2 && `, ${detail.city2}`}
              </Text>
            </div>
          )}

          {detail.postOfficeBox && (
            <div>
              <Text type="secondary">Почтовый ящик:</Text>
              <br />
              <Text strong>{detail.postOfficeBox}</Text>
            </div>
          )}
        </Space>

        {/* Контакты */}
        {(detail.telephone || detail.fax || detail.email || detail.homepage) && (
          <>
            <Divider size={'small'}/>
            <Row gutter={[16, 16]}>
              {detail.telephone && (
                <Col xs={24} md={12}>
                  <Space>
                    <PhoneOutlined />
                    <Text strong>{detail.telephone}</Text>
                  </Space>
                </Col>
              )}

              {detail.fax && (
                <Col xs={24} md={12}>
                  <Space>
                    <PhoneOutlined />
                    <Text strong>{detail.fax}</Text>
                  </Space>
                </Col>
              )}

              {detail.email && (
                <Col xs={24} md={12}>
                  <Space>
                    <MailOutlined />
                    <a href={`mailto:${detail.email}`}>{detail.email}</a>
                  </Space>
                </Col>
              )}

              {detail.homepage && (
                <Col xs={24} md={12}>
                  <Space>
                    <GlobalOutlined />
                    <a
                      href={
                        detail.homepage.startsWith('http')
                          ? detail.homepage
                          : `https://${detail.homepage}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {detail.homepage}
                    </a>
                  </Space>
                </Col>
              )}
            </Row>
          </>
        )}

        {/* Страна */}
        {(detail.countryCode || detail.postalCountryCode) && (
          <>
            <Divider size={'small'}/>
            <div>
              <Text type="secondary">Страна:</Text>
              <br />
              <Text strong>
                {detail.countryCode || detail.postalCountryCode}
              </Text>
            </div>
          </>
        )}
      </Space>
    </Card>
  )
}