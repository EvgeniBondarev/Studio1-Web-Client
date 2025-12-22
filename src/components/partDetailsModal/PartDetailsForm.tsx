import { Form, Input } from 'antd'
import type { EtPart } from '../../api/types.ts'
import {usePartStrings} from '../hooks/usePartStrings.tsx';

interface PartDetailsFormProps {
    part: EtPart
    producerId?: number
}

export interface PartFormField {
    label: string
    name: keyof EtPart
    render?: () => React.ReactNode
}

export const PartDetailsForm = ({ part,producerId  }: PartDetailsFormProps) => {
    const { getText } = usePartStrings(producerId, [part?.Name, part?.Description])
    const [form] = Form.useForm<Partial<EtPart>>()

    if (part) {
        form.setFieldsValue(part)
    }

    const fields: PartFormField[] = [
        { label: 'Код', name: 'Code' },
        { label: 'Длинный код', name: 'LongCode' },
        { label: 'Вес', name: 'Weight' },
        { label: 'Сессия', name: 'SessionId' },
        {
            label: 'Наименование',
            name: 'Name',
            render: () => getText(part.Name),
        },
        {
            label: 'Описание',
            name: 'Description',
            render: () => getText(part.Description),
        },
        { label: 'Объём', name: 'V' },
        { label: 'Старый ID', name: 'OldId' },
    ]

    const getFieldValue = (field: PartFormField) =>
        field.render ? String(field.render() ?? '—') : String(part[field.name] ?? '—')

    return (
        <Form
            form={form}
            layout="vertical"
            disabled
            initialValues={part}
        >
            {fields.map((field) => (
                <Form.Item key={field.name} label={field.label} name={field.name}>
                    <Input readOnly style={{ color: 'black' }} value={getFieldValue(field)} />
                </Form.Item>
            ))}
        </Form>
    )
}
