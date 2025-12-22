import { useCallback, useEffect, useState } from 'react'
import { App as AntdApp, Layout, Dropdown, Button, Menu, ConfigProvider, theme } from 'antd'
import { UserOutlined, LogoutOutlined, AppstoreOutlined, ExperimentOutlined, SettingOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { EtPart, EtProducer, CtUser } from './api/types.ts'
import { ProducerPanel } from './components/ProducerPanel.tsx'
import {PartsPanel, type SearchType} from './components/partsPanel'
import { PartDetailsModal } from './components/partDetailsModal/PartDetailsModal.tsx'
import { LoginPage } from './components/LoginPage.tsx'
import { UserProfileModal } from './components/UserProfileModal.tsx'
import { fetchProducerById } from './api/producers.ts'
import { fetchPartsPage, fetchPartsPageWithoutProducer } from './api/parts.ts'

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
  const [producerSiderWidth, setProducerSiderWidth] = useState(() => {
    if (typeof window === 'undefined') {
      return 480
    }
    const stored = window.localStorage.getItem('producerSiderWidth')
    const parsed = stored ? Number(stored) : NaN
    return Number.isFinite(parsed) && parsed >= 220 && parsed <= 640 ? parsed : 480
  })
  const [producerSearch, setProducerSearch] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.sessionStorage.getItem(PRODUCER_SEARCH_SESSION_KEY) ?? ''
  })
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false)
  const [autoEditPart, setAutoEditPart] = useState<EtPart | null>(null)
  const [initialPartsSearch, setInitialPartsSearch] = useState<string | undefined>(undefined)
  const [initialPartsSearchType, setInitialPartsSearchType] = useState<'by_producer' | 'without_producer' | undefined>(undefined)
  const [partsProducerIds, setPartsProducerIds] = useState<number[]>([])

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

  // Обработка URL параметров для открытия редактирования детали
  useEffect(() => {
    if (!currentUser || urlParamsProcessed) {
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const producerIdParam = urlParams.get('producerId')
    const codeParam = urlParams.get('code')

    if (producerIdParam && codeParam) {
      const producerId = Number.parseInt(producerIdParam, 10)
      if (Number.isFinite(producerId)) {
        // Загружаем производителя
        fetchProducerById(producerId)
          .then((producer) => {
            setSelectedProducer(producer)
            setPartsSearchType('by_producer')
            setInitialPartsSearchType('by_producer')
            setInitialPartsSearch(codeParam)
            // Загружаем деталь по коду с учетом производителя
            return fetchPartsPage(producerId, undefined, codeParam, 'exact')
          })
          .then((partsPage) => {
            const part = partsPage.items.find((p) => p.Code === codeParam)
            if (part) {
              // Найдено с учетом производителя
              setSelectedPart(part)
              setAutoEditPart(part)
              // Удаляем параметры из URL
              urlParams.delete('producerId')
              urlParams.delete('code')
              const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '')
              window.history.replaceState({}, '', newUrl)
              setUrlParamsProcessed(true)
              // Сбрасываем initialSearch и initialSearchType после небольшой задержки
              setTimeout(() => {
                setInitialPartsSearch(undefined)
                setInitialPartsSearchType(undefined)
              }, 100)
            } else {
              // Не найдено с учетом производителя, ищем без учета производителя
              setPartsSearchType('without_producer')
              setInitialPartsSearchType('without_producer')
              return fetchPartsPageWithoutProducer(codeParam, 'exact')
            }
          })
          .then((partsPageWithoutProducer) => {
            if (partsPageWithoutProducer) {
              const part = partsPageWithoutProducer.items.find((p) => p.Code === codeParam)
              if (part) {
                // Найдено без учета производителя
                setSelectedPart(part)
                setAutoEditPart(part)
              }
              // Удаляем параметры из URL
              urlParams.delete('producerId')
              urlParams.delete('code')
              const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '')
              window.history.replaceState({}, '', newUrl)
              setUrlParamsProcessed(true)
              // Сбрасываем initialSearch и initialSearchType после небольшой задержки
              setTimeout(() => {
                setInitialPartsSearch(undefined)
                setInitialPartsSearchType(undefined)
              }, 100)
            }
          })
          .catch((error) => {
            console.error('Ошибка при загрузке данных из URL:', error)
            setUrlParamsProcessed(true)
          })
      } else {
        setUrlParamsProcessed(true)
      }
    } else {
      setUrlParamsProcessed(true)
    }
  }, [currentUser, urlParamsProcessed])

  const handleSearchTypeChange = useCallback((type: SearchType) => {
    setPartsSearchType(type)
    if (type === 'by_producer') {
      setPartsProducerIds([])
    }
  }, [])

  const handleProducerIdsChange = useCallback((ids: number[]) => {
    setPartsProducerIds((prev) => {
      if (ids.length !== prev.length ||
          ids.some((id, index) => id !== prev[index])) {
        return ids
      }
      return prev
    })
  }, [])

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

  const handleProducerSiderResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    const startX = event.clientX
    const startWidth = producerSiderWidth

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const nextWidth = Math.min(640, Math.max(220, startWidth + deltaX))
      setProducerSiderWidth(nextWidth)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('producerSiderWidth', String(nextWidth))
      }
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

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
        <AntdApp>
          <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} />
        </AntdApp>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
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
          <Sider
            width={producerSiderWidth}
            theme={isDarkMode ? 'dark' : 'light'}
            className="splitter"
          >
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
                filterProducerIds={partsSearchType === 'without_producer' ? partsProducerIds : undefined}
            />
          </div>
            <div
              className="splitter-resizer"
              onMouseDown={handleProducerSiderResizeMouseDown}
            />
        </Sider>
        <Layout>
            <Content style={{ padding: 16, height: '100%', overflow: 'hidden' }}>
            <PartsPanel
              producer={selectedProducer}
              selectedPart={selectedPart}
              onSelectPart={(part) => setSelectedPart(part)}
              onSearchTypeChange={handleSearchTypeChange}
              onProducerIdsChange={handleProducerIdsChange}
              autoEditPart={autoEditPart}
              onAutoEditProcessed={() => setAutoEditPart(null)}
              initialSearch={initialPartsSearch}
              initialSearchType={initialPartsSearchType}
            />
          </Content>
          </Layout>
        </Layout>
      </Layout>

      <PartDetailsModal producer={selectedProducer} part={selectedPart} onClose={() => setSelectedPart(null)} />
      <UserProfileModal
        user={currentUser}
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App

