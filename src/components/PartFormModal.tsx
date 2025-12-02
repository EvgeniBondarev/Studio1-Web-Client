import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Checkbox, Col, Descriptions, Form, Input, InputNumber, Modal, Row } from 'antd'
import dayjs from 'dayjs'
import type { EtPart } from '../api/types.ts'
import { fetchSessionById } from '../api/sessions.ts'

interface PartFormModalProps {
  open: boolean
  initialValues?: Partial<EtPart>
  mode: 'create' | 'edit'
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: Partial<EtPart>) => void
}

const formatSessionDate = (value?: string) => {
  if (!value) {
    return '—'
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : value
}

export const PartFormModal = ({
  open,
  initialValues,
  mode,
  loading,
  onCancel,
  onSubmit,
}: PartFormModalProps) => {
  const [form] = Form.useForm<Partial<EtPart>>()

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

  const { data: selectedSession } = useQuery({
    queryKey: ['ctSession', initialValues?.SessionId],
    queryFn: () => (initialValues?.SessionId ? fetchSessionById(initialValues.SessionId) : Promise.resolve(undefined)),
    enabled: Boolean(initialValues?.SessionId),
  })

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit(values)
    } catch {
      // validation errors handled by antd
    }
  }

  const fileImportValue = selectedSession?.Source ?? '—'
  const importDateValue = selectedSession ? formatSessionDate(selectedSession.Start) : '—'

  return (
    <Modal
      title={mode === 'edit' ? 'Редактирование детали' : 'Новая деталь'}
      open={open}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={onCancel}
      width={720}
      styles={{ body: { maxHeight: '80vh', overflow: 'auto' } }}
      destroyOnHidden
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="SessionId" hidden>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="Code"
              label="Короткий код"
              rules={[{ required: true, message: 'Укажите короткий код' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="LongCode" label="Литературный код">
              <Input />
            </Form.Item>
            <Form.Item name="Description" label="Описание">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="Rating" label="Рейтинг">
              <InputNumber style={{ width: '100%' }} min={0} max={10} />
            </Form.Item>
            <Form.Item name="Accepted" valuePropName="checked">
              <Checkbox>Проверена</Checkbox>
            </Form.Item>
            <Form.Item name="NoChangeFlag" valuePropName="checked">
              <Checkbox>Узел проверен</Checkbox>
            </Form.Item>
            <Form.Item name="Old" valuePropName="checked">
              <Checkbox>Устарела</Checkbox>
            </Form.Item>
            <Form.Item name="Dead" valuePropName="checked">
              <Checkbox>Не производится</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="Weight" label="Вес, кг">
              <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="V" label="Объём">
              <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Сессия импорта">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Файл импорта">{fileImportValue}</Descriptions.Item>
            <Descriptions.Item label="Дата импорта">{importDateValue}</Descriptions.Item>
          </Descriptions>
        </Form.Item>
      </Form>
    </Modal>
  )
}

