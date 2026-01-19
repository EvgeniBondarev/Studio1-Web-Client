import {LinkOutlined} from '@ant-design/icons';
import {Card, Typography} from 'antd';

type Props = {
  linkagesLength: number;
}

export const ApplicabilityShortInfo =({linkagesLength}:Props)=>{
  return (
    <Card style={{marginBottom: 24}}>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <LinkOutlined style={{width: 20, height: 20}}/>
        <Typography.Title level={5} style={{margin: 0}}>
          Применимость ({linkagesLength})
        </Typography.Title>
      </div>

      <div style={{padding: 24}}>
        {linkagesLength > 0 ? (
          <>
            <p style={{fontSize: 12, color: '#6b7280', marginBottom: 8}}>
              Найдено <span style={{fontWeight: 600}}>{linkagesLength}</span> применений
            </p>
            <a
              href="#linkages-table"
              style={{
                fontSize: 12,
                color: '#2563eb',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Посмотреть таблицу →
            </a>
          </>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12}}>Применимость не найдена</p>
        )}
      </div>
    </Card>
  )
}