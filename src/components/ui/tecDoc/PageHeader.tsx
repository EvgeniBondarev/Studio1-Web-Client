import {Flex, Space, Typography} from 'antd';
import {Link} from 'react-router-dom';
import {ArrowLeftOutlined} from '@ant-design/icons';
import React from 'react';

const {Title, Text} = Typography;

interface Props {
  title?: string
  backLink?: {
    to: string
    label: string
  }
  right?: React.ReactNode
}

export const PageHeader = ({
                             title,
                             backLink,
                             right,
                           }: Props) => {
  return (
    <Flex align="center" justify="space-between" style={{height: 64}}>
      <Flex align="center" gap={12}>
        {backLink && (
          <Link to={backLink.to} className="header-link">
            <Space size={6}>
              <ArrowLeftOutlined/>
              <Text>{backLink.label}</Text>
            </Space>
          </Link>
        )}

        {title && (
          <Title level={3} style={{margin: 0}}>
            {title}
          </Title>
        )}
      </Flex>

      {right}
    </Flex>
  )
}
