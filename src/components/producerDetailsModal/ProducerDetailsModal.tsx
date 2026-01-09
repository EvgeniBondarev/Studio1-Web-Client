import {Button, Form, Modal} from 'antd'
import type {EtProducer} from '../../api/types.ts'
import {ProducerDetailsCard} from '../ui/producerDatailsCard';

interface ProducerDetailsModalProps {
    producer?: EtProducer | null
    onClose: () => void
    onSelectProducer?: (producerId: number) => void
}

export const ProducerDetailsModal = ({producer, onClose, onSelectProducer}: ProducerDetailsModalProps) => {
    const [form] = Form.useForm<Partial<EtProducer>>()

    if (producer) {
        form.setFieldsValue(producer)
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
            <ProducerDetailsCard producer={producer}
            onSelectProducer={onSelectProducer}
            />
        </Modal>
    )
}