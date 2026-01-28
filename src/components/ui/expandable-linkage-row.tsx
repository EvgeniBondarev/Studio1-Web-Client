import {useState, Fragment} from 'react'
import {Button, Card, Space, Table, Tag, Typography} from 'antd'
import {DownOutlined, UpOutlined} from '@ant-design/icons'
import type {LinkageDto} from '../../api/TecDoc/api/types.ts';
import {getLinkageTypeLabel} from '../tecDocPage/detailpage/articles/ArticleDetailPage.tsx';

const {Text, Paragraph} = Typography;

interface ExpandableLinkageRowProps {
  linkage: LinkageDto
  index: number
}

export function ExpandableLinkageRow({
                                       linkage,
                                       index,
                                     }: ExpandableLinkageRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const vehicle = linkage.vehicle
  const model = vehicle?.model
  const manufacturer = model?.manufacturer
  const attributes = vehicle?.attributes || []

  const attributeColumns = [
    {
      title: 'Группа',
      dataIndex: 'attributeGroup',
      key: 'attributeGroup',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Тип',
      dataIndex: 'attributeType',
      key: 'attributeType',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Заголовок',
      dataIndex: 'displayTitle',
      key: 'displayTitle',
    },
    {
      title: 'Значение',
      dataIndex: 'displayValue',
      key: 'displayValue',
      render: (text: string) => <Text strong>{text}</Text>,
    },
  ]

  return (
    <Fragment>
      <tr
        style={{
          borderBottom: '1px solid #f3f4f6',
          cursor: 'default',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <td style={{padding: 8, color: '#6b7280'}}>
          <Text type="secondary">{index}</Text>
        </td>

        <td style={{padding: 8}}>
          <Space orientation="vertical" size={2}>
            <Tag color="blue">
              {getLinkageTypeLabel(linkage.linkageTypeId)}
            </Tag>
            <Text type="secondary" style={{fontSize: 12}}>
              ({linkage.linkageTypeId})
            </Text>
          </Space>
        </td>

        <td style={{padding: 8, fontSize: 12}}>
          <Text code>
            {linkage.linkageId}
          </Text>
        </td>

        <td style={{padding: 8, fontSize: 12}}>
          {vehicle ? (
            <Space orientation="vertical" size={2} style={{width: '100%'}}>
              <Text strong style={{color: '#111827'}}>
                {vehicle.description}
              </Text>
              {vehicle.fullDescription && vehicle.fullDescription !== vehicle.description && (
                <Paragraph
                  style={{
                    fontSize: 10,
                    color: '#6b7280',
                    margin: 0,
                  }}
                >
                  {vehicle.fullDescription}
                </Paragraph>
              )}
            </Space>
          ) : (
            <Text type="secondary">—</Text>
          )}
        </td>

        <td style={{padding: 8}}>
          {model ? (
            <Space orientation="vertical" size={1} style={{width: '100%'}}>
              {manufacturer && (
                <Text strong >
                  {manufacturer.description}
                </Text>
              )}
              <Text type={'secondary'}>{model.description}</Text>
              {model.fullDescription && model.fullDescription !== model.description && (
                <Text type={'secondary'} >
                  {model.fullDescription}
                </Text>
              )}
            </Space>
          ) : (
            <Text type="secondary">—</Text>
          )}
        </td>

        <td style={{padding: 8}}>
          <Text type="secondary">
            {vehicle?.constructionInterval || model?.constructionInterval || '—'}
          </Text>
        </td>

        <td style={{padding: 8, fontSize: 12}}>
          {attributes.length > 0 ? (
            <Button
              type="link"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{padding: 0, fontSize: 12}}
              icon={isExpanded ? <UpOutlined/> : <DownOutlined/>}
            >
              Характеристики ({attributes.length})
            </Button>
          ) : (
            <Text type="secondary">—</Text>
          )}
        </td>
      </tr>

      {isExpanded && attributes.length > 0 && (
        <tr>
          <td colSpan={7} >
            <Card
              size="small"
              styles={{body:{padding: 0}}}
            >
              <Table
                dataSource={attributes.map((attr, idx) => ({
                  ...attr,
                  key: idx,
                }))}
                columns={attributeColumns}
                pagination={false}
                size="small"
              />
            </Card>
          </td>
        </tr>
      )}
    </Fragment>
  )
}
