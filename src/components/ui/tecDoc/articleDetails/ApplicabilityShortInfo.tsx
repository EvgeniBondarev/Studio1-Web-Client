import {LinkOutlined} from '@ant-design/icons';
import {Card, Typography, Space} from 'antd';

type Props = {
  linkagesLength: number
}

export const ApplicabilityShortInfo = ({linkagesLength}: Props) => {

  return (
    <Card
      title={<Space align="center" size={8} style={{width: '100%'}}>
        <LinkOutlined style={{fontSize: 16}}/>
        <Typography.Title level={4} style={{margin: 0, flex: 1}}>
          Применимость ({linkagesLength})
        </Typography.Title>
      </Space>}
    >
      {linkagesLength > 0 ? (
        <Space orientation="vertical" size={8} style={{width: '100%'}}>
          <Typography.Text type="secondary">
            Найдено <strong>{linkagesLength}</strong> применений
          </Typography.Text>

          <Typography.Link
            href="#linkages-table"
            style={{fontSize: 12}}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Посмотреть таблицу →
          </Typography.Link>
        </Space>
      ) : (
        <Typography.Text type="secondary" style={{fontSize: 12}}>
          Применимость не найдена
        </Typography.Text>
      )}
    </Card>
  )
}