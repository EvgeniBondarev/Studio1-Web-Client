import {Card, Typography} from 'antd';
import type {EanCodeDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  eanCodes: EanCodeDto[]
}

export const EANCodes = ({eanCodes}: Props) => {
  return (
    <Card style={{marginBottom: 24,}}>
      <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
        <Typography.Title level={4} style={{margin: 0}}>
          EAN коды ({eanCodes.length})
        </Typography.Title>
      </div>

      <div style={{padding: 24}}>
        {eanCodes.length > 0 ? (
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
            {eanCodes.map((ean, idx) => (
              <span
                key={idx}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  backgroundColor: '#f3f4f6',
                  padding: '4px 12px',
                  borderRadius: 4,
                  border: '1px solid #e5e7eb',
                }}
              >
            {ean.ean}
          </span>
            ))}
          </div>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12}}>EAN коды не найдены</p>
        )}
      </div>
    </Card>
  )
}