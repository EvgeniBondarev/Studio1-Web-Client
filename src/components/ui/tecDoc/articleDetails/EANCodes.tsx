import {Card, Typography, Space, Tag, Empty} from 'antd';
import type {EanCodeDto} from '../../../../api/TecDoc/api/types.ts';

type Props = {
  eanCodes: EanCodeDto[]
}

export const EANCodes = ({eanCodes}: Props) => {

  return (
    <Card
      title={
        <Typography.Title level={4} style={{margin: 0}}>
          {`EAN коды (${eanCodes.length})`}
        </Typography.Title>
      }
    >
      {eanCodes.length > 0 ? (
        <Space wrap size={8} style={{width: '100%'}}>
          {eanCodes.map((ean, idx) => (
            <Tag
              key={idx}
              variant={'outlined'}
              color={'blue'}
              style={{fontSize: 14, padding: '5px 8px'}}
            >
              {ean.ean}
            </Tag>
          ))}
        </Space>
      ) : (
        <Empty description={'EAN коды не найдены'}/>
      )}
    </Card>
  )
}