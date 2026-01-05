import {Button, Flex, Space, Typography} from 'antd';
import type {EtProducer} from '../../../api/types.ts';
import type {ReactNode} from 'react';
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';
import type {SearchType} from '../../../config/resources.ts';

type Props = {
    producer?: EtProducer | null;
    searchType: SearchType;
    search?: string;
    countLabel: ReactNode;
    isFetching: boolean;
    onReload: () => void;
    onAdd: () => void;
}

export const PartsHeader = ({
                                producer,
                                searchType,
                                countLabel,
                                isFetching,
                                onReload,
                                onAdd,
                                search,
                            }: Props) => {
    return (
        <Flex justify="space-between" align="center" className="panel-header" style={{marginBottom: 0}}>
            <Space align="center" size={8} wrap>
                <Typography.Title level={5} style={{margin: 0}}>
                    Детали
                </Typography.Title>
                {searchType === 'by_producer' && producer && (
                    <Typography.Text type="secondary" style={{fontSize: 12}}>
                        Производитель: {producer.Name ?? producer.Prefix}
                    </Typography.Text>
                )}
                <Typography.Text type="secondary" style={{fontSize: 12}}>
                    {searchType === 'without_producer' && search?.trim()
                        ? `Найдено: ${countLabel}`
                        : `Деталей: ${countLabel}`}
                </Typography.Text>
            </Space>
            <Space size={4}>
                <Button
                    icon={<ReloadOutlined/>}
                    onClick={onReload}
                    type="text"
                    size="small"
                    loading={isFetching}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    size="small"
                    disabled={!producer}
                    onClick={onAdd}
                >
                    Добавить
                </Button>
            </Space>
        </Flex>
    )
}