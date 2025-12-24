import {message, Modal, Space, Typography} from 'antd';
import type {EtProducer} from '../../../api/types.ts';
import {linkProducers} from '../../../api/producers.ts';
import {useMutation, useQueryClient} from '@tanstack/react-query';


interface Props {
    open: boolean;
    selectedProducerIds: Set<number>;
    filteredProducers: EtProducer[];
    linkTargetProducer: EtProducer | null;
    onSuccess: () => void
    onCancel: () => void
}

export const LinkToOriginalModal = ({
                                        open,
                                        selectedProducerIds,
                                        filteredProducers,
                                        linkTargetProducer,
                                        onSuccess,
                                        onCancel,
                                    }: Props) => {
    const queryClient = useQueryClient();
    const linkMutation = useMutation({
        mutationFn: ({producerIds, targetProducerId}: { producerIds: number[]; targetProducerId: number }) =>
            linkProducers(producerIds, targetProducerId),
        onSuccess: () => {
            message.success('Ссылка на оригинал успешно создана');
            queryClient.invalidateQueries({queryKey: ['producers']});
            onSuccess()
        },
        onError: () => {
            message.error('Ошибка при создании ссылки на оригинал');
        },
    });

    const handleLinkConfirm = () => {
        if (!linkTargetProducer) {
            return;
        }
        const producerIdsArray = Array.from(selectedProducerIds);
        if (producerIdsArray.length === 0) {
            return;
        }
        linkMutation.mutate({
            producerIds: producerIdsArray,
            targetProducerId: linkTargetProducer.Id,
        });
    };

    return (
        <Modal
            title="Ссылка на оригинал"
            open={open}
            onOk={handleLinkConfirm}
            onCancel={onCancel}
            okText="Связать с оригиналом"
            cancelText="Отмена"
            confirmLoading={linkMutation.isPending}
            width={600}
        >
            <Space orientation="vertical" style={{width: '100%'}} size="middle">
                <div>
                    <Typography.Text strong>Выбранные производители для ссылки на оригинал:</Typography.Text>
                    <div
                        style={{
                            marginTop: 8,
                            maxHeight: 200,
                            overflow: 'auto',
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            padding: 8,
                        }}
                    >
                        {Array.from(selectedProducerIds)
                            .map((id) => filteredProducers.find((p) => p.Id === id))
                            .filter(Boolean)
                            .map((producer) => (
                                <div key={producer!.Id} style={{padding: '4px 0'}}>
                                    <Space>
                                        <Typography.Text strong>{producer!.Prefix ?? '—'}</Typography.Text>
                                        <Typography.Text>{producer!.Name ?? '—'}</Typography.Text>
                                        <Typography.Text type="secondary" style={{fontSize: 12}}>
                                            (ID: {producer!.Id})
                                        </Typography.Text>
                                    </Space>
                                </div>
                            ))}
                    </div>
                </div>

                <div>
                    <Typography.Text strong>Связать с оригинальным производителем:</Typography.Text>
                    <div
                        style={{
                            marginTop: 8,
                            padding: 12,
                            background: 'var(--ant-color-fill-tertiary)',
                            borderRadius: 4,
                        }}
                    >
                        <Space orientation="vertical" size={4}>
                            <Typography.Text strong>
                                {linkTargetProducer?.Name ?? '—'}
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{fontSize: 12}}>
                                Префикс: {linkTargetProducer?.Prefix ?? '—'}
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{fontSize: 12}}>
                                ID: {linkTargetProducer?.Id}
                            </Typography.Text>
                        </Space>
                    </div>
                </div>

                <Typography.Text type="secondary" style={{fontSize: 12}}>
                    RealId выделенных производителей будет заменен на ID выбранного производителя
                    ({linkTargetProducer?.Id}).
                </Typography.Text>
            </Space>
        </Modal>
    );
};