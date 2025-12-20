import {Alert, Button, Space, Tag, Typography} from 'antd';
import {LinkOutlined} from '@ant-design/icons';

type Props = {
    isNonOriginal: boolean | null | undefined
    name?: string
    realId?: number
    goToMainProducer: () => void
}

export const ProducerDetailsHeader = ({name, realId, isNonOriginal, goToMainProducer}: Props) => {
    return (
        <Space orientation="vertical" size="middle" style={{width: '100%', marginBottom: 16}}>
            <Typography.Title level={4} style={{margin: 0}}>
                {name ?? 'Без названия'}
            </Typography.Title>
            {isNonOriginal && (
                <Alert
                    description={
                        <>
                            <Space>
                                <Tag color="orange">Не оригинальный производитель</Tag>
                                <Typography.Text type="secondary" style={{fontSize: 12}}>
                                    Это альтернативное название производителя
                                </Typography.Text>
                            </Space>
                            <Button
                                type="link"
                                icon={<LinkOutlined/>}
                                size="small"
                                style={{padding: 0, height: 'auto', marginTop: 8}}
                                onClick={goToMainProducer}
                            >
                                Перейти к основному производителю (ID: {realId})
                            </Button>
                        </>
                    }
                    type="info"
                    showIcon
                    style={{marginTop: 8}}
                />
            )}
        </Space>
    )
}