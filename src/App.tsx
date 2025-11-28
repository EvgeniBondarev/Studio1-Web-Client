import { useEffect, useState } from 'react'
import { Layout, Dropdown, Button, Menu, ConfigProvider, theme } from 'antd'
import { UserOutlined, LogoutOutlined, AppstoreOutlined, ExperimentOutlined, SettingOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { EtPart, EtProducer, CtUser } from './api/types.ts'
import { ProducerPanel } from './components/ProducerPanel.tsx'
import { PartsPanel } from './components/PartsPanel.tsx'
import { PartDetailsDrawer } from './components/PartDetailsDrawer.tsx'
import { LoginPage } from './components/LoginPage.tsx'
import { UserProfileModal } from './components/UserProfileModal.tsx'

const { Sider, Content } = Layout

const PRODUCER_SEARCH_SESSION_KEY = 'producerPanelSearch'
const AUTH_USER_KEY = 'authUser'
const THEME_KEY = 'appTheme'

const App = () => {
  const [currentUser, setCurrentUser] = useState<CtUser | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }
    const stored = window.localStorage.getItem(AUTH_USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    const stored = window.localStorage.getItem(THEME_KEY)
    return stored === 'dark'
  })
  const [selectedProducer, setSelectedProducer] = useState<EtProducer | null>(null)
  const [selectedPart, setSelectedPart] = useState<EtPart | null>(null)
  const [activeTab, setActiveTab] = useState('producers')
  const [navCollapsed, setNavCollapsed] = useState(true)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (currentUser) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser))
    } else {
      window.localStorage.removeItem(AUTH_USER_KEY)
    }
  }, [currentUser])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (isDarkMode) {
      document.body.classList.add('ant-dark')
    } else {
      document.body.classList.remove('ant-dark')
    }
  }, [isDarkMode])

  const handleLogin = (user: CtUser) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setSelectedProducer(null)
    setSelectedPart(null)
  }
  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div>
          <div style={{ fontWeight: 500 }}>{currentUser?.Login}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>Профиль</div>
        </div>
      ),
      icon: <UserOutlined />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation()
        setProfileModalOpen(true)
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'theme',
      label: isDarkMode ? 'Светлая тема' : 'Тёмная тема',
      icon: isDarkMode ? <SunOutlined /> : <MoonOutlined />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation()
        setIsDarkMode(!isDarkMode)
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Выход',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation()
        handleLogout()
      },
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

  const antdTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: isDarkMode
      ? {
          colorBgBase: '#0f0f0f',
          colorBgContainer: '#181818',
          colorBgElevated: '#212121',
          colorBorder: '#303030',
          colorBorderSecondary: '#272727',
          colorText: 'rgba(255, 255, 255, 0.9)',
          colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
          colorTextTertiary: 'rgba(255, 255, 255, 0.5)',
          colorFill: 'rgba(255, 255, 255, 0.1)',
          colorFillSecondary: 'rgba(255, 255, 255, 0.05)',
        }
      : undefined,
  }

  if (!currentUser) {
    return (
      <ConfigProvider theme={antdTheme}>
        <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} />
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <Layout className="app-layout">
        <Sider
          width={200}
          collapsible
          collapsedWidth={56}
          theme={isDarkMode ? 'dark' : 'light'}
          className="navigation-sider"
          collapsed={navCollapsed}
          onCollapse={(collapsed) => setNavCollapsed(collapsed)}
        >
          <div className="navigation-sider__content">
            <div
              style={{
                padding: navCollapsed ? '16px 8px' : '16px',
                textAlign: 'center',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e5e7eb'}`,
              }}
            >
              <img
                src="/logo.svg"
                alt="Logo"
                style={{
                  height: navCollapsed ? 40 : 60,
                  width: 'auto',
                  maxWidth: '100%',
                }}
              />
            </div>
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              items={navItems}
              onClick={({ key }) => setActiveTab(key)}
              style={{ borderInlineEnd: 'none' }}
            />
            <div className="navigation-sider__footer">
              <Dropdown menu={{ items: profileMenuItems }} placement="topRight">
                <Button type="text" icon={<UserOutlined />} title={currentUser.Login} />
              </Dropdown>
            </div>
          </div>
        </Sider>
        <Layout>
        <Sider width={360} theme={isDarkMode ? 'dark' : 'light'} className="splitter">
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
      <UserProfileModal
        user={currentUser}
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </ConfigProvider>
  )
}

export default App

