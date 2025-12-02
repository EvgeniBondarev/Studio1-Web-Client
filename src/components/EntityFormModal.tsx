import { useEffect } from 'react'
import { Form, Input, InputNumber, Modal } from 'antd'
import type { FieldConfig } from '../config/resources.ts'

interface EntityFormModalProps<T extends object> {
  title: string
  open: boolean
  fields: FieldConfig[]
  initialValues?: Partial<T>
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: Partial<T>) => void
}

export const EntityFormModal = <T extends object>({
  title,
  open,
  fields,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: EntityFormModalProps<T>) => {
  const [form] = Form.useForm<Partial<T>>()

  useEffect(() => {
    if (!open) {
      return
    }
    if (initialValues) {
      form.setFieldsValue(initialValues as any)
    } else {
      form.resetFields()
    }
  }, [open, initialValues, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit(values)
    } catch {
      // validation errors are handled by antd
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        {fields.map((field) => {
          const commonProps = {
            name: field.name,
            label: field.label,
            rules: field.required ? [{ required: true, message: 'Обязательное поле' }] : [],
          }

          switch (field.type) {
            case 'number':
              return (
                <Form.Item key={field.name} {...commonProps}>
                  <InputNumber style={{ width: '100%' }} min={field.min} placeholder={field.placeholder} />
                </Form.Item>
              )
            case 'textarea':
              return (
                <Form.Item key={field.name} {...commonProps}>
                  <Input.TextArea rows={3} placeholder={field.placeholder} />
                </Form.Item>
              )
            case 'url':
              return (
                <Form.Item
                  key={field.name}
                  {...commonProps}
                  rules={[
                    ...(field.required ? [{ required: true, message: 'Обязательное поле' }] : []),
                    { type: 'url' as const, message: 'Введите корректный URL' },
                  ]}
                >
                  <Input placeholder={field.placeholder} />
                </Form.Item>
              )
            default:
              return (
                <Form.Item key={field.name} {...commonProps}>
                  <Input placeholder={field.placeholder} />
                </Form.Item>
              )
          }
        })}
      </Form>
    </Modal>
  )
}

