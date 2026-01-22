import {useSearchParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Spin, Empty, Form, Typography, Divider, Row, Col, Space} from 'antd'
import {PartFormCard} from './ui/partFormCard'
import {useState} from 'react'
import {fetchPartsPage} from '../api/parts.ts'
import type {EtPartForm} from './partsPanel/components/PartFormModal.tsx';
import {fetchProductByBrandAndArticle} from '../api/partByBrandArticle.ts';
import {fetchProducerById} from '../api/producers.ts';
import {ProducerDetailsCard} from './ui/producerDatailsCard';
import {AdditionalInfo, Characteristics, ImgInfo, MainInfo} from './ui/tecDoc/articleDetails';
import {articleService} from '../api/TecDoc/api/services/article.service.ts';
import type {SupplierSearchResult} from '../api/TecDoc/api/types.ts';
import type {ApiError} from '../api/TecDoc/api/client.ts';
import {supplierSearchService} from '../api/TecDoc/api/services/supplier-search.service.ts';
import {useFilteredAttributes} from './tecDocPage/useFilteredAttributes.ts';
import {type SupplierDetailResponse, supplierService} from '../api/TecDoc/api/services/supplier.service.ts';
import {SupplierDetailsCard} from './ui/tecDoc/supplierDetails/SupplierDetailsCard.tsx';

const {Title} = Typography;

export function PublicPartInfoPage() {
  const [params] = useSearchParams()
  const producerId = Number(params.get('producerId'))
  const code = params.get('code') || ''
  const [form] = Form.useForm<EtPartForm>()
  const [activeTab, setActiveTab] = useState<string>('details')

  const {data: part, isLoading} = useQuery({
    queryKey: ['public-part', producerId, code],
    queryFn: async () => {
      if (!producerId || !code) return null
      const result = await fetchPartsPage(producerId, undefined, code, 'exact')
      return result.items[0] ?? null
    },
    enabled: Boolean(producerId && code),
  })

  const {data: producer} = useQuery({
    queryKey: ['producer', producerId],
    queryFn: () => fetchProducerById(producerId),
    enabled: Boolean(producerId),
  })

  const brand = producer?.Name

  const {data: PRdata, isLoading: isPRLoading} = useQuery({
    queryKey: ['prData', part?.Code],
    queryFn: () => fetchProductByBrandAndArticle(brand ?? '', part?.Code ?? ''),
    enabled: Boolean(brand && part?.Code),
  })

  const {data: supplierData, isLoading: isSupplierLoading} = useQuery<SupplierSearchResult, ApiError>({
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

  const {data: TecDocData, isLoading: TecDocLoading} = useQuery({
    queryKey: ['article', supplierId, code],
    queryFn: () =>
      articleService.getByExactMatch(supplierId!, code),
    enabled: Boolean(supplierId && code),
    staleTime: 10 * 60 * 1000, // 10 минут
  })

  const {data: supplierDetailData, isLoading: supplierDetailLoading,} = useQuery<SupplierDetailResponse, ApiError>({
    queryKey: ['supplier', supplierId],
    queryFn: () => supplierService.getById(supplierId!),
    enabled: !!supplierId && !isNaN(supplierId),
    staleTime: 30 * 60 * 1000, // 30 минут
  })

  const article = TecDocData?.article
  const supplier = TecDocData?.supplier
  const images = TecDocData?.images || []
  const information = TecDocData?.information || []
  const attributes = TecDocData?.attributes ?? [];

  const {
    filteredAttributes,
    search: attributesSearch,
    setSearch: setAttributesSearch
  } =
    useFilteredAttributes(attributes);

  if (isLoading || TecDocLoading || isSupplierLoading || supplierDetailLoading) return <Spin/>
  if (!part) return <Empty description="Деталь не найдена"/>
  return (
    <div style={{maxWidth: 1200, padding: 30, margin: '0 auto'}}>

      {/* Верхняя форма, выравнивание с левой колонкой */}
      <Row justify="start">
        <Col xs={24} md={16}>
          <Title level={3}>Информация о детали</Title>
          <PartFormCard
            form={form}
            initialValues={part}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isPRLoading={isPRLoading}
            PRdata={PRdata}
            readOnly
          />
        </Col>
      </Row>

      <Row gutter={24} style={{marginTop: 24}}>
        <Col xs={24} md={16}>
          <Space
            orientation="vertical"
            size="middle"
            style={{width: '100%'}}
          >
            {article && <MainInfo article={article} supplier={supplier}/>}

            {attributes.length > 0 && (
              <Characteristics
                filteredAttributes={filteredAttributes}
                attributesSearch={attributesSearch}
                attributesLength={attributes.length}
                setAttributesSearch={setAttributesSearch}
              />
            )}

            <AdditionalInfo information={information}/>

            {supplierDetailData?.supplier && (
              <SupplierDetailsCard
                supplier={supplierDetailData?.supplier}
                details={supplierDetailData?.details || []}
              />
            )}
          </Space>
        </Col>

        <Col xs={24} md={8}>
          <ImgInfo images={images} supplierIdNum={producerId}/>
        </Col>
      </Row>


      <Divider style={{margin: '40px 0'}}/>

      <Row justify="start">
        <Col xs={24} md={16}>
          <Title level={3}>Информация о производителе</Title>
          <ProducerDetailsCard producer={producer}/>
        </Col>
      </Row>

    </div>
  );
}
