import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Spin, Empty, Form } from 'antd'
import { PartFormCard } from './ui/partFormCard'
import { useState } from 'react'
import { fetchPartsPage } from '../api/parts.ts'
import type {EtPartForm} from './partsPanel/components/PartFormModal.tsx';
import {fetchProductByBrandAndArticle} from '../api/partByBrandArticle.ts';
import {fetchProducerById} from '../api/producers.ts';


export function PublicPartInfoPage() {
  const [params] = useSearchParams()
  const producerId = Number(params.get('producerId'))
  const code = params.get('code')
  const [form] = Form.useForm<EtPartForm>()
  const [activeTab, setActiveTab] = useState<string>('details')

  const { data: part, isLoading } = useQuery({
    queryKey: ['public-part', producerId, code],
    queryFn: async () => {
      if (!producerId || !code) return null
      const result = await fetchPartsPage(producerId, undefined, code, 'exact')
      return result.items[0] ?? null
    },
    enabled: Boolean(producerId && code),
  })

  const { data: producer } = useQuery({
    queryKey: ['producer', producerId],
    queryFn: () => fetchProducerById(producerId),
    enabled: Boolean(producerId),
  })

  const brand = producer?.Name

  const { data: PRdata, isLoading: isPRLoading } = useQuery({
    queryKey: ['prData', part?.Code],
    queryFn: () => fetchProductByBrandAndArticle(brand ?? '', part?.Code ?? ''),
    enabled: Boolean(brand && part?.Code),
  })
  if (isLoading) return <Spin />
  if (!part) return <Empty description="Деталь не найдена" />
  return (
    <div  style={{margin: 30}}>
      <PartFormCard
        form={form}
        initialValues={part}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPRLoading={isPRLoading}
        PRdata={PRdata}
      />
    </div>
  )
}
