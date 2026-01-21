import {Card, Empty, Space, Typography} from 'antd';
import type {InformationDto} from '../../../../api/TecDoc/api/types.ts';

const {Paragraph} = Typography

type Props = {
  information: InformationDto[]
}

export const AdditionalInfo = ({information}: Props) => {
  return (
    <Card
      title={
        <Typography.Title level={4}>
          Дополнительная информация ({information.length})
        </Typography.Title>
      }
    >
      {information.length > 0 ? (
        <Space orientation="vertical" size={16} style={{width: '100%'}}>
          {information.map((info, idx) => (

            <Space key={idx} align="start" orientation="vertical" size={4} style={{width: '100%'}}>
              <Space align="center">
                <Typography.Text strong>
                  {info.informationType}
                </Typography.Text>
                <Typography.Text type="secondary">
                  (Ключ: {info.informationTypeKey})
                </Typography.Text>
              </Space>

              <Paragraph
                style={{
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                  borderLeft: '3px solid #2563eb',
                  paddingLeft: '8px'
                }}
              >
                {info.informationText}
              </Paragraph>
            </Space>
          ))}
        </Space>
      ) : (
        <Empty description={'Дополнительная информация отсутствует'}/>
      )}
    </Card>
  )
}