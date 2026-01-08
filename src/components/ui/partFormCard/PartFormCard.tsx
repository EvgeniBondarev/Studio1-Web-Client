import {Col, Form, type FormInstance, Input, Row, Tabs} from 'antd'

import {DataTab} from './dataTab/DataTab'
import {ImagesTab} from './imageTab/ImagesTab'
import {LeftCol} from './formColumns/LeftCol'
import {RightCol} from './formColumns/RightCol'
import {DetailsTab} from './detailsTab/DetailsTab'
import type {CtSession, EtPart} from '../../../api/types.ts';
import {usePartStrings} from '../../hooks/usePartStrings.tsx';
import dayjs from 'dayjs';
import {useEffect} from 'react';
import type {EtPartForm} from '../../partsPanel/components/PartFormModal.tsx';



interface PartFormCardProps {
  initialValues?: Partial<EtPart>
  form: FormInstance<EtPartForm>
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedSession?: CtSession
  PRdata?: any
  isPRLoading: boolean
}

export const PartFormCard = ({
                               initialValues,
                               form,
                               activeTab,
                               setActiveTab,
                               selectedSession,
                               PRdata,
                               isPRLoading
                             }: PartFormCardProps) => {


  const { getText } = usePartStrings(initialValues?.ProducerId, [initialValues?.Name, initialValues?.Description])

  // Подготовка данных для формы
  useEffect(() => {
    if (!initialValues) {
      form.resetFields()
      return
    }

    const description = getText(initialValues.Name)
    form.setFieldsValue({
      ...initialValues,
      DescriptionText: (description && typeof description === 'string') ? description : ''
    })
  }, [initialValues, getText, form])


  const formatSessionDate = (value?: string) => {
    if (!value) return '—'
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : value
  }

  const fileImportValue = selectedSession ?? '—'
  const importDateValue = selectedSession ? formatSessionDate(selectedSession.Start) : '—'

  const tabsConfig = [
    {
      key: 'details',
      label: 'Деталь',
      content: <DetailsTab fileImportValue={fileImportValue}
                           importDateValue={importDateValue}/>
    },
    {
      key: 'images',
      label: 'Изображение',
      content: <ImagesTab prImages={PRdata?.Images}
                          prIsLoading={isPRLoading}
                          code={initialValues?.Code ?? ''}
                          producerId={initialValues?.ProducerId?.toString() ?? ''}/>
    },
    {
      key: 'pr_data',
      label: 'PR Данные',
      content: <DataTab attributes={PRdata?.Attributes}
                        categories={PRdata?.VendorCategories}/>
    },
  ]

  return (
    <Form layout="vertical" form={form}>
      <Form.Item name="SessionId" hidden>
        <Input/>
      </Form.Item>
      <Row gutter={16}>
        <Col span={14}>
          <LeftCol/>
        </Col>
        <Col span={10}>
          <RightCol/>
        </Col>
      </Row>
      <div style={{
        minHeight: 300, overflowY: 'auto',
        overflowX: 'hidden', marginBottom: '20px'
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabsConfig.map(tab => ({
            key: tab.key,
            label: tab.label,
            children: tab.content,
          }))}
        />
      </div>
    </Form>
  )
}
