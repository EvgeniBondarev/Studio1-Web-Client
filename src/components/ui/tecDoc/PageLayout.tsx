import {Layout} from 'antd';
import React from 'react';

const {Header, Content} = Layout

interface Props {
  header: React.ReactNode
  children: React.ReactNode
  maxWidth?: number
}

export const PageLayout = ({
                             header,
                             children,
                             maxWidth = 1200
                           }: Props) => {
  return (
    <Layout style={{minHeight: '100vh'}}>
      <Header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
        }}
      >
        <div style={{maxWidth, margin: '0 auto'}}>
          {header}
        </div>
      </Header>

      <Content style={{padding: 24}} className="full-height content-scroll">
        <div style={{maxWidth, margin: '0 auto'}}>
          {children}
        </div>
      </Content>
    </Layout>
  )
}
