import { Link } from 'react-router-dom'
import { Layout, Button, Typography, Row, Col, Space } from 'antd'
import { SearchOutlined, TeamOutlined } from '@ant-design/icons'
import './tecDoc.css'

const { Header, Content, Footer } = Layout
const { Title, Paragraph } = Typography

export const TecDocPage = () => {
  return (
    <Layout className="full-height">
      {/* Header */}
      <Header className={'tecdoc-header'}>
        <div className={'tecdoc-header-inner'}>
          <Title level={3} style={{ margin: 0 }}>
            TecDoc
          </Title>

          <Space size="large">
            <Link to="/search/articles" className={'header-link'}>Поиск артикулов</Link>
            <Link to="/search/suppliers" className={'header-link'}>Поиск поставщиков</Link>
          </Space>
        </div>
      </Header>

      {/* Main */}
      <Content style={{ padding: '64px 16px' }} className="full-height content-scroll">
        <div className={'container'}>
          <Title level={1}>Каталог автозапчастей TecDoc</Title>

          <Paragraph className={'description'}>
            Быстрый поиск артикулов и поставщиков с поддержкой русского языка
          </Paragraph>

          {/* Actions */}
          <Space size="middle" wrap>
            <Link to="/search/articles">
              <Button type="primary" size="large" icon={<SearchOutlined />}>
                Поиск артикулов
              </Button>
            </Link>

            <Link to="/search/suppliers">
              <Button size="large" icon={<TeamOutlined />}>
                Поиск поставщиков
              </Button>
            </Link>
          </Space>

          {/* Features */}
          <Row gutter={[32, 32]} style={{ marginTop: 80 }}>
            <Col xs={24} md={8}>
              <div>
                <div style={{ fontSize: 32 }}>⚡</div>
                <Title level={4}>Быстрый поиск</Title>
                <Paragraph type="secondary">
                  Elasticsearch обеспечивает мгновенный поиск по миллионам записей
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div>
                <div style={{ fontSize: 32 }}>🔍</div>
                <Title level={4}>Умный поиск</Title>
                <Paragraph type="secondary">
                  Поддержка частичного поиска и нечеткого совпадения
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div>
                <div style={{ fontSize: 32 }}>🌐</div>
                <Title level={4}>Русский язык</Title>
                <Paragraph type="secondary">
                  Полнотекстовый поиск с поддержкой русского языка
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', color: '#888' }}>
        TecDoc API Client v1.0.0
      </Footer>
    </Layout>
  )
}