import {Link} from 'react-router-dom'
import {Layout, Button, Typography, Row, Col, Space, Flex} from 'antd'
import {SearchOutlined, TeamOutlined} from '@ant-design/icons'
import './tecDoc.css'
import {ROUTE_TEC_DOC} from './constants/routes.ts';
import {PageLayout} from '../ui/tecDoc/PageLayout.tsx';
import {PageHeader} from '../ui/tecDoc/PageHeader.tsx';

const {Footer} = Layout
const {Title, Paragraph} = Typography

export const TecDocPage = () => {
  return (
    <PageLayout
      header={
        <PageHeader
          title="TecDoc"
          right={
            <Space size="large">
              <Link to={ROUTE_TEC_DOC.SEARCH_ARTICLES} className="header-link">
                Поиск артикулов
              </Link>
              <Link to={ROUTE_TEC_DOC.SEARCH_SUPPLIERS} className="header-link">
                Поиск поставщиков
              </Link>
            </Space>
          }
        />
      }
    >

      {/* Main */}
      <Flex justify="center" style={{marginTop: 56}}>
        <Space vertical style={{textAlign: 'center'}}>
          <Title level={1}>Каталог автозапчастей TecDoc</Title>

          <Paragraph className={'description'}>
            Быстрый поиск артикулов и поставщиков с поддержкой русского языка
          </Paragraph>

          {/* Actions */}
          <Space size="middle" wrap>
            <Link to={ROUTE_TEC_DOC.SEARCH_ARTICLES}>
              <Button type="primary" size="large" icon={<SearchOutlined/>}>
                Поиск артикулов
              </Button>
            </Link>

            <Link to={ROUTE_TEC_DOC.SEARCH_SUPPLIERS}>
              <Button size="large" icon={<TeamOutlined/>}>
                Поиск поставщиков
              </Button>
            </Link>
          </Space>

          {/* Features */}
          <Row gutter={[32, 32]} style={{marginTop: 80}}>
            <Col xs={24} md={8}>
              <div>
                <div style={{fontSize: 32}}>⚡</div>
                <Title level={4}>Быстрый поиск</Title>
                <Paragraph type="secondary">
                  Elasticsearch обеспечивает мгновенный поиск по миллионам записей
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div>
                <div style={{fontSize: 32}}>🔍</div>
                <Title level={4}>Умный поиск</Title>
                <Paragraph type="secondary">
                  Поддержка частичного поиска и нечеткого совпадения
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div>
                <div style={{fontSize: 32}}>🌐</div>
                <Title level={4}>Русский язык</Title>
                <Paragraph type="secondary">
                  Полнотекстовый поиск с поддержкой русского языка
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Space>
      </Flex>
      {/* Footer */}
      <Footer style={{textAlign: 'center', color: '#888'}}>
        TecDoc API Client v1.0.0
      </Footer>
    </PageLayout>
  )
}