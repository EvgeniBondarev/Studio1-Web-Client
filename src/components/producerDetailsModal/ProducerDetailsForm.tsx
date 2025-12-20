import { Form, Input, Typography } from 'antd'
import type { EtProducer } from '../../api/types.ts'

interface ProducerDetailsFormProps {
    producer: EtProducer
    isNonOriginal: boolean |null | undefined
}

export interface ProducerFormField {
    label: string
    name: keyof EtProducer
}

export const ProducerDetailsForm = ({ producer, isNonOriginal }: ProducerDetailsFormProps) => {
    const [form] = Form.useForm<Partial<EtProducer>>()

    // Заполняем форму данными при открытии
    if (producer) {
        form.setFieldsValue(producer)
    }

    const fields: ProducerFormField[] = [
        {label: 'ID', name: 'Id'},
        {label: 'RealId', name: 'RealId'},
        {label: 'Префикс', name: 'Prefix'},
        {label: 'Рыночный префикс', name: 'MarketPrefix'},
        {label: 'Рейтинг', name: 'Rating'},
        {label: 'Домен', name: 'Domain'},
        {label: 'Сайт', name: 'Www'},
        {label: 'Адрес', name: 'Address',},
        {label: 'TecDoc ID', name: 'TecdocSupplierId'},
        {label: 'Exist ID', name: 'ExistId'},
        {label: 'Exist Name', name: 'ExistName'},
    ]

    return (
        <Form
            form={form}
            layout="vertical"
            disabled
            initialValues={producer}
        >
            {fields.map(({label, name}) => {
                if (name === 'RealId') {
                    return (
                        <Form.Item key={name} label={label} name={name}>
                            <Input
                                readOnly
                                style={{color: 'black'}}
                                suffix={isNonOriginal && producer?.RealId ? (
                                    <Typography.Text type="secondary" style={{fontSize: 12}}>
                                        (основной производитель)
                                    </Typography.Text>
                                ) : null}
                            />
                        </Form.Item>
                    )
                }
                return (
                    <Form.Item key={name} label={label} name={name}>
                        <Input readOnly
                               style={{color: 'black'}}/>
                    </Form.Item>
                )
            })}
        </Form>
    )
}