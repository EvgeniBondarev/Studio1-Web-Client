import {Card, Typography} from 'antd';
import type {InformationDto} from '../../../../api/TecDoc/api/types.ts';

type Props ={
  information: InformationDto[]
}

export const AdditionalInfo=({information}:Props)=>{
  return (
    <Card style={{marginBottom: 24,}}>
      <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
        <Typography.Title level={4} style={{margin: 0}}>
          Дополнительная информация ({information.length})
        </Typography.Title>
      </div>

      <div style={{padding: 24}}>
        {information.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {information.map((info, idx) => (
              <div
                key={idx}
                style={{borderLeft: '4px solid #3b82f6', paddingLeft: 16,}}
              >
                <div
                  style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,}}>
                  <h4 style={{fontWeight: 600, color: '#111827', margin: 0, fontSize: 14,}}>
                    {info.informationType}
                  </h4>
                  <span style={{fontSize: 10, color: '#6b7280',}}>
                (Ключ: {info.informationTypeKey})
              </span>
                </div>
                <p style={{color: '#374151', fontSize: 12, whiteSpace: 'pre-wrap', margin: 0,}}>
                  {info.informationText}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{color: '#6b7280', fontSize: 12}}>
            Дополнительная информация отсутствует
          </p>
        )}
      </div>
    </Card>
  )
}