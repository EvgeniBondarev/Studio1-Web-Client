import {useEffect, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import { Form, Modal,} from 'antd'
import type {EtPart} from '../../../api/types.ts'
import {fetchSessionById} from '../../../api/sessions.ts'
import {fetchProductByBrandAndArticle} from '../../../api/partByBrandArticle.ts';
import {usePartStrings} from '../../hooks/usePartStrings.tsx';
import {PartFormCard} from '../../ui/partFormCard';
import type {SupplierSearchResult} from '../../../api/TecDoc/api/types.ts';
import type {ApiError} from '../../../api/TecDoc/api/client.ts';
import {supplierSearchService} from '../../../api/TecDoc/api/services/supplier-search.service.ts';
import {articleService} from '../../../api/TecDoc/api/services/article.service.ts';

interface PartFormModalProps {
    open: boolean
    brand?: string
    initialValues?: Partial<EtPart>
    mode: 'create' | 'edit'
    loading?: boolean
    onCancel: () => void
    onSubmit: (values: Partial<EtPart>) => void
}

export interface EtPartForm extends Partial<EtPart> {
    DescriptionText?: string
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

    const {data: supplierData} = useQuery<SupplierSearchResult, ApiError>({
        queryKey: ['supplierSearch', brand],
        queryFn: () => supplierSearchService.search({
            query: brand || null,
            page: 1,
            pageSize: 20,
            sortBy: 'relevance',
            sortDescending: false,
        }),
        enabled: Boolean(brand),
        staleTime: 5 * 60 * 1000, // 5 минут
    })

    const supplierId = supplierData?.items?.[0]?.supplierId

    const {data: TecDocData} = useQuery({
        queryKey: ['article', supplierId],
        queryFn: () =>
          articleService.getByExactMatch(supplierId!, String(initialValues?.Code)),
        enabled: Boolean(supplierId && initialValues?.Code),
        staleTime: 10 * 60 * 1000, // 10 минут
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
            <PartFormCard
            form={form}
            initialValues={initialValues}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isPRLoading={isLoading}
            PRdata={PRdata}
            selectedSession={selectedSession}
            tecDocImg={TecDocData?.images}
            />

        </Modal>
    )
}

