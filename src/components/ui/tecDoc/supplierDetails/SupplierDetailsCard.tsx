import {Button, Card, Col, Divider, Row, Space, Typography} from 'antd'
import {BankFilled, InboxOutlined,} from '@ant-design/icons'
import {Link} from 'react-router-dom';
import type {SupplierInfoDto} from '../../../../api/TecDoc/api/types.ts';
import type {SupplierDetailDto} from '../../../../api/TecDoc/api/services/supplier.service.ts';
import {MainInfo} from './MainInfo.tsx';
import {ContactCard} from './ContactCard.tsx';

const {Title, Text} = Typography

type Props = {
  supplier: SupplierInfoDto
  details: SupplierDetailDto[]
}

export const SupplierDetailsCard = ({supplier, details}: Props) => {
  return (
    <Card>
      <Space orientation="vertical" size={24} style={{ width: '100%'}}>
        {/* Заголовок карточки */}
        <Row gutter={16} align="middle" style={{ marginBottom: 0 }}>
          <Col flex="none">
            <div
              style={{
                padding: 12,
                backgroundColor: '#dbeafe',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BankFilled style={{ fontSize: 32, color: '#2563eb' }} />
            </div>
          </Col>
          <Col flex="auto">
            <Space orientation="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>
                {supplier.description}
              </Title>
              {supplier.matchcode && (
                <Text style={{ fontSize: 18, color: '#4b5563' }}>
                  Код:{' '}
                  <Text strong style={{ fontFamily: 'monospace' }}>
                    {supplier.matchcode}
                  </Text>
                </Text>
              )}
            </Space>
          </Col>
        </Row>

        {/* Основная информация */}
        <MainInfo
          id={supplier.id}
          hasNewVersionArticles={supplier.hasNewVersionArticles}
          nbrOfArticles={supplier.nbrOfArticles}
          dataVersion={supplier.dataVersion}
        />

        {/* Детали поставщика */}
        {details.length > 0 && (
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Divider size={'small'}/>
            <Title level={4} style={{ margin: 0 }}>
              Контактная информация
            </Title>
            <Space orientation="vertical" size={16} style={{ width: '100%' }}>
              {details.map((detail, idx) => (
                <ContactCard key={idx} detail={detail} index={idx} />
              ))}
            </Space>
          </Space>
        )}

        {/* Ссылка на артикулы */}
        <Space orientation="vertical" style={{ width: '100%' }}>
          <Divider size={'small'}/>
          <Link to={`/tecdoc/search/articles?supplierId=${supplier.id}`}>
            <Button type="primary" icon={<InboxOutlined />} size="large">
              Найти артикулы этого поставщика
            </Button>
          </Link>
        </Space>
      </Space>
    </Card>
  )
}