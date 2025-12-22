import {Button, Form, Modal, Typography} from 'antd'
import type {EtProducer} from '../../api/types.ts'
import {ProducerDetailsHeader} from './ProducerDetailsHeader.tsx';
import {ProducerDetailsForm} from './ProducerDetailsForm.tsx';

interface ProducerDetailsModalProps {
    producer?: EtProducer | null
    onClose: () => void
    onSelectProducer?: (producerId: number) => void
}

export const ProducerDetailsModal = ({producer, onClose, onSelectProducer}: ProducerDetailsModalProps) => {
    const [form] = Form.useForm<Partial<EtProducer>>()
    const isNonOriginal = producer && producer.RealId !== undefined && producer.RealId !== null && producer.RealId !== producer.Id


    if (producer) {
        form.setFieldsValue(producer)
    }

    const handleGoToMainProducer = () => {
        if (onSelectProducer && producer?.RealId) {
            onSelectProducer(producer.RealId)
            onClose()
        }
    }

    return (
        <Modal
            title="Информация о производителе"
            open={Boolean(producer)}
            onCancel={onClose}
            width={700}
            footer={[
                <Button onClick={onClose}>
                    Закрыть
                </Button>,
            ]}
        >
            {producer ? (
                <>
                    <ProducerDetailsHeader name={producer.Name}
                                           goToMainProducer={handleGoToMainProducer}
                                           isNonOriginal={isNonOriginal}
                                           realId={producer.RealId}
                    ></ProducerDetailsHeader>
                    <ProducerDetailsForm
                        producer={producer}
                        isNonOriginal={isNonOriginal}
                    />
                </>
            ) : (
                <Typography.Text type="secondary">Выберите производителя для просмотра информации</Typography.Text>
            )}
        </Modal>
    )
}