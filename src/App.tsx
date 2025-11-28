import { useEffect, useState } from 'react'
import { Layout, Dropdown, Button, Menu } from 'antd'
import { UserOutlined, LogoutOutlined, AppstoreOutlined, ExperimentOutlined, SettingOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { EtPart, EtProducer } from './api/types.ts'
import { ProducerPanel } from './components/ProducerPanel.tsx'
import { PartsPanel } from './components/PartsPanel.tsx'
import { PartDetailsDrawer } from './components/PartDetailsDrawer.tsx'

const { Sider, Content } = Layout

const PRODUCER_SEARCH_SESSION_KEY = 'producerPanelSearch'

const App = () => {
  const [selectedProducer, setSelectedProducer] = useState<EtProducer | null>(null)
  const [selectedPart, setSelectedPart] = useState<EtPart | null>(null)
  const [activeTab, setActiveTab] = useState('producers')
  const [navCollapsed, setNavCollapsed] = useState(true)
  const [partsSearchType, setPartsSearchType] = useState<'by_producer' | 'without_producer'>('by_producer')
  const [producerSearch, setProducerSearch] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.sessionStorage.getItem(PRODUCER_SEARCH_SESSION_KEY) ?? ''
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.sessionStorage.setItem(PRODUCER_SEARCH_SESSION_KEY, producerSearch)
  }, [producerSearch])
  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Профиль',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Выход',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ]

  const navItems: MenuProps['items'] = [
    {
      key: 'producers',
      label: 'Производители',
      icon: <AppstoreOutlined />,
    },
    {
      key: 'test1',
      label: 'Тест 1',
      icon: <ExperimentOutlined />,
    },
    {
      key: 'test2',
      label: 'Тест 2',
      icon: <SettingOutlined />,
    },
  ]

  return (
    <>
      <Layout className="app-layout">
        <Sider
          width={200}
          collapsible
          collapsedWidth={56}
          theme="light"
          className="navigation-sider"
          collapsed={navCollapsed}
          onCollapse={(collapsed) => setNavCollapsed(collapsed)}
        >
          <div className="navigation-sider__content">
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              items={navItems}
              onClick={({ key }) => setActiveTab(key)}
              style={{ borderInlineEnd: 'none' }}
            />
            <div className="navigation-sider__footer">
              <Dropdown menu={{ items: profileMenuItems }} placement="topRight">
                <Button type="text" icon={<UserOutlined />} />
              </Dropdown>
            </div>
          </div>
        </Sider>
        <Layout>
          <Sider width={360} theme="light" className="splitter">
            <div style={{ padding: 16, height: '100%', overflow: 'hidden' }}>
              <ProducerPanel
                selectedProducer={selectedProducer}
                onSelect={(producer) => {
                  setSelectedProducer(producer)
                  setSelectedPart(null)
                }}
                externalSearch={producerSearch}
                onSearchChange={setProducerSearch}
                searchType={partsSearchType}
              />
            </div>
          </Sider>
          <Layout>
            <Content style={{ padding: 16, height: '100%', overflow: 'hidden' }}>
              <PartsPanel
                producer={selectedProducer}
                selectedPart={selectedPart}
                onSelectPart={(part) => setSelectedPart(part)}
                onFocusProducer={(producer) => {
                  setProducerSearch(producer.Name ?? producer.MarketPrefix ?? producer.Prefix ?? '')
                  setSelectedProducer(producer)
                }}
                onSearchTypeChange={setPartsSearchType}
              />
            </Content>
          </Layout>
        </Layout>
      </Layout>

      <PartDetailsDrawer producer={selectedProducer} part={selectedPart} onClose={() => setSelectedPart(null)} />
    </>
  )
}

export default App

