import {Button, Divider, Modal, Space, Typography} from 'antd'
import type {EtPart, EtProducer} from '../../api/types.ts'
import {PartDetailsForm} from './PartDetailsForm.tsx';
import {PartStatusTags} from './PartStatusTags.tsx';

interface PartDetailsDrawerProps {
    producer?: EtProducer | null
    part?: EtPart | null
    onClose: () => void
}

export const PartDetailsModal = ({producer, part, onClose}: PartDetailsDrawerProps) => {

    return (
        <Modal
            title="Карточка детали"
            open={Boolean(part)}
            onCancel={onClose}
            width={700}
            destroyOnHidden
            footer={[
                <Button onClick={onClose}>
                    Закрыть
                </Button>,
            ]}
        >
            {part ? (
                <Space  orientation="vertical"  style={{width: '100%'}} size="small">
                    <div>
                        <Typography.Text type="secondary">Производитель</Typography.Text>
                        <Typography.Title level={5} style={{marginTop: 4}}>
                            {producer?.Name ?? producer?.Prefix ?? 'Неизвестно'}
                        </Typography.Title>
                    </div>

                    <PartDetailsForm part={part} producerId={producer?.Id}/>

                    <Divider size={'small'}/>

                    <PartStatusTags
                        accepted={part.Accepted}
                        noChangeFlag={part.NoChangeFlag}
                        deleted={part.Deleted}
                        old={part.Old}
                        dead={part.Dead}
                    />
                </Space>
            ) : (
                <Typography.Text type="secondary">Выберите деталь для просмотра информации</Typography.Text>
            )}
        </Modal>
    )
}

