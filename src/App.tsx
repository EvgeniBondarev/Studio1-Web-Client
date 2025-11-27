import { useState } from 'react'
import { Layout } from 'antd'
import type { EtPart, EtProducer } from './api/types.ts'
import { ProducerPanel } from './components/ProducerPanel.tsx'
import { PartsPanel } from './components/PartsPanel.tsx'
import { PartDetailsDrawer } from './components/PartDetailsDrawer.tsx'

const { Sider, Content } = Layout

const App = () => {
  const [selectedProducer, setSelectedProducer] = useState<EtProducer | null>(null)
  const [selectedPart, setSelectedPart] = useState<EtPart | null>(null)

  return (
    <>
      <Layout className="app-layout">
        <Sider width={360} theme="light" className="splitter">
          <div style={{ padding: 24, height: '100%', overflow: 'hidden' }}>
            <ProducerPanel
              selectedProducer={selectedProducer}
              onSelect={(producer) => {
                setSelectedProducer(producer)
                setSelectedPart(null)
              }}
            />
          </div>
        </Sider>
        <Layout>
          <Content style={{ padding: 24, height: '100%', overflow: 'hidden' }}>
            <PartsPanel
              producer={selectedProducer}
              selectedPart={selectedPart}
              onSelectPart={(part) => setSelectedPart(part)}
            />
          </Content>
        </Layout>
      </Layout>

      <PartDetailsDrawer producer={selectedProducer} part={selectedPart} onClose={() => setSelectedPart(null)} />
    </>
  )
}

export default App

