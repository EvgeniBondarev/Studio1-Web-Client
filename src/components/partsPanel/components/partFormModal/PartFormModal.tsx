import {useEffect, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Col, Form, Input, Modal, Row, Tabs} from 'antd'
import dayjs from 'dayjs'
import type {EtPart} from '../../../../api/types.ts'
import {fetchSessionById} from '../../../../api/sessions.ts'
import {fetchProductByBrandAndArticle} from '../../../../api/partByBrandArticle.ts';
import {DataTab} from './dataTab/DataTab.tsx';
import {ImagesTab} from './imageTab/ImagesTab.tsx';
import {LeftCol} from './formColumns/LeftCol.tsx';
import {RightCol} from './formColumns/RightCol.tsx';
import {DetailsTab} from './detailsTab/DetailsTab.tsx';
import {usePartStrings} from '../../../hooks/usePartStrings.tsx';

interface PartFormModalProps {
    open: boolean
    brand?: string
    initialValues?: Partial<EtPart>
    mode: 'create' | 'edit'
    loading?: boolean
    onCancel: () => void
    onSubmit: (values: Partial<EtPart>) => void
}

interface EtPartForm extends Partial<EtPart> {
    DescriptionText?: string
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
                                  brand
                              }: PartFormModalProps) => {
    const [form] = Form.useForm<EtPartForm>()
    const [activeTab, setActiveTab] = useState<string>('details')

    const {data: selectedSession} = useQuery({
        queryKey: ['ctSession', initialValues?.SessionId],
        queryFn: () => (initialValues?.SessionId ? fetchSessionById(initialValues.SessionId) : Promise.resolve(undefined)),
        enabled: Boolean(initialValues?.SessionId),
    })

    const {data: PRdata, isLoading} = useQuery({
        queryKey: ['prData', brand, initialValues?.Code],
        queryFn: () => fetchProductByBrandAndArticle(brand ?? '', initialValues?.Code ?? ''),
        enabled: Boolean(brand && initialValues?.Code),
    })

    const { getText } = usePartStrings(initialValues?.ProducerId, [initialValues?.Name, initialValues?.Description])

    useEffect(() => {
        if (!open) {
            setActiveTab('details')
            return
        }

        if (initialValues) {
            const description = getText(initialValues.Name)
            form.setFieldsValue({
                ...initialValues,
                DescriptionText: (description && typeof description === 'string')
                  ? description
                  : ''
            })
            return
        }

        form.resetFields()
    }, [open, initialValues, getText, form])


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

    const tabsConfig = [
        {
            key: 'details',
            label: 'Деталь',
            content: <DetailsTab fileImportValue={fileImportValue} importDateValue={importDateValue}/>
        },
        {
            key: 'images',
            label: 'Изображение',
            content: <ImagesTab prImages={PRdata?.Images}
                                prIsLoading={isLoading}
                                code={initialValues?.Code ?? ''}
                                producerId={initialValues?.ProducerId?.toString() ?? ''}/>
        },
        {
            key: 'pr_data',
            label: 'PR Данные',
            content: <DataTab attributes={PRdata?.Attributes} categories={PRdata?.VendorCategories}/>
        },
    ]

    return (
        <Modal
            title={mode === 'edit' ? 'Редактирование детали' : 'Новая деталь'}
            open={open}
            onOk={handleOk}
            confirmLoading={loading}
            onCancel={onCancel}
            width={720}
            styles={{body: {maxHeight: '80vh', overflow: 'auto'}}}
            destroyOnHidden
        >
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
        </Modal>
    )
}

