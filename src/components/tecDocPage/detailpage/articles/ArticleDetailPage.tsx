import {useEffect, useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Spin, Alert, Layout, Row, Col, Typography} from 'antd'
import {LeftCircleOutlined} from '@ant-design/icons'
import {useQuery} from '@tanstack/react-query'
import {articleService} from '../../../../api/TecDoc/api/services/article.service.ts';
import '../../tecDoc.css'
import {SearchInput} from '../../../ui/search-input.tsx';
import {
  Accessories,
  AdditionalInfo, ApplicabilityShortInfo, ApplicabilityTable,
  Characteristics,
  Cross,
  EANCodes, ImgInfo,
  MainInfo, NewNumbers,
  OEMNumbers
} from '../../../ui/tecDoc/articleDetails';

const {Text} = Typography;
const {Header, Content} = Layout

// ================= utils =================

// Функция для получения расшифровки типа применимости
function getLinkageTypeLabel(typeId: string): string {
  const typeMap: Record<string, string> = {
    P: 'Легковой автомобиль',
    PassengerCar: 'Легковой автомобиль',
    C: 'Коммерческий транспорт',
    CommercialVehicle: 'Коммерческий транспорт',
    M: 'Мотоцикл',
    Motorbike: 'Мотоцикл',
    A: 'Ось',
    Axle: 'Ось',
    E: 'Двигатель',
    Engine: 'Двигатель',
  }
  return typeMap[typeId] || typeId
}

const DEFAULT_URL = '/tecdoc/search/articles'

// ================= page =================

export const ArticleDetailPage = () => {

  const {supplierId, articleNumber} = useParams()

  const supplierIdNum = Number(supplierId)

  // Состояние для URL поиска с сохраненными параметрами
  const [searchUrl, setSearchUrl] = useState(DEFAULT_URL)

  // Восстанавливаем URL поиска из sessionStorage при монтировании
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('articleSearchParams')
      if (saved) {
        const parsed = JSON.parse(saved)
        const params = new URLSearchParams()

        if (parsed.query) {
          params.set('q', parsed.query)
        }

        if (parsed.supplierId !== undefined) {
          params.set('supplierId', parsed.supplierId.toString())
        }

        if (parsed.sortBy && parsed.sortBy !== 'relevance') {
          params.set('sortBy', parsed.sortBy)
        }

        if (parsed.sortDescending) {
          params.set('sortDescending', 'true')
        }

        if (parsed.page && parsed.page > 1) {
          params.set('page', parsed.page.toString())
        }

        if (parsed.pageSize && parsed.pageSize !== 20) {
          params.set('pageSize', parsed.pageSize.toString())
        }

        const queryString = params.toString()
        setSearchUrl(queryString ? `${DEFAULT_URL}?${queryString}` : DEFAULT_URL)
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }, [])

  // ===== search states =====
  // Состояния для поиска - должны быть объявлены до любых условных возвратов
  const [globalSearch, setGlobalSearch] = useState('')
  const [crossesSearch, setCrossesSearch] = useState('')
  const [oeNumbersSearch, setOeNumbersSearch] = useState('')
  const [attributesSearch, setAttributesSearch] = useState('')
  const [linkagesSearch, setLinkagesSearch] = useState('')

  if (!supplierId || !articleNumber) {
    return <div style={{padding: 24}}>Неверный путь</div>
  }

  const {data, isLoading, error} = useQuery({
    queryKey: ['article', supplierIdNum, articleNumber],
    queryFn: () =>
      articleService.getByExactMatch(supplierIdNum, articleNumber),
    staleTime: 10 * 60 * 1000, // 10 минут
  })

  // Деструктуризация данных с дефолтными значениями для безопасного использования в useMemo
  const article = data?.article
  const supplier = data?.supplier
  const images = data?.images || []
  const eanCodes = data?.eanCodes || []
  const information = data?.information || []
  const accessories = data?.accessories || []
  const newNumbers = data?.newNumbers || []


  // Обертываем массивы в useMemo для стабильности зависимостей
  const crosses = useMemo(() => data?.crosses ?? [], [data?.crosses])
  const oeNumbers = useMemo(() => data?.oeNumbers ?? [], [data?.oeNumbers])
  const attributes = useMemo(() => data?.attributes ?? [], [data?.attributes])
  const linkages = useMemo(() => data?.linkages ?? [], [data?.linkages])

  // ===== filters =====

  // Функции фильтрации - должны быть объявлены до условных возвратов
  const filteredCrosses = useMemo(() => {
    const searchQuery = globalSearch || crossesSearch
    if (!searchQuery.trim()) return crosses
    const query = searchQuery.toLowerCase()
    return crosses.filter((cross) => {
      const oeNbr = (cross.oeNbr || cross.oENbr || '').toLowerCase()
      const manufacturer = cross.manufacturer?.description.toLowerCase() || ''
      const manufacturerId = cross.manufacturerId.toString()
      return oeNbr.includes(query) || manufacturer.includes(query) || manufacturerId.includes(query)
    })
  }, [crosses, crossesSearch, globalSearch])

  const filteredOeNumbers = useMemo(() => {
    const searchQuery = globalSearch || oeNumbersSearch
    if (!searchQuery.trim()) return oeNumbers
    const query = searchQuery.toLowerCase()
    return oeNumbers.filter((oe) => {
      const oeNbr = (oe.oeNbr || oe.oENbr || '').toLowerCase()
      return oeNbr.includes(query)
    })
  }, [oeNumbers, oeNumbersSearch, globalSearch])

  const filteredAttributes = useMemo(() => {
    const searchQuery = globalSearch || attributesSearch
    if (!searchQuery.trim()) return attributes
    const query = searchQuery.toLowerCase()
    return attributes.filter((attr) => {
      return (
        attr.description.toLowerCase().includes(query) ||
        attr.displayTitle.toLowerCase().includes(query) ||
        attr.displayValue.toLowerCase().includes(query) ||
        attr.id.toString().includes(query)
      )
    })
  }, [attributes, attributesSearch, globalSearch])

  const filteredLinkages = useMemo(() => {
    const searchQuery = globalSearch || linkagesSearch
    if (!searchQuery.trim()) return linkages
    const query = searchQuery.toLowerCase()
    return linkages.filter((linkage) => {
      const vehicle = linkage.vehicle
      const model = vehicle?.model
      const manufacturer = model?.manufacturer
      const linkageId = linkage.linkageId.toString()
      const linkageTypeId = linkage.linkageTypeId.toLowerCase()
      const linkageTypeLabel = getLinkageTypeLabel(linkage.linkageTypeId).toLowerCase()

      const vehicleDesc = vehicle?.description.toLowerCase() || ''
      const vehicleFullDesc = vehicle?.fullDescription.toLowerCase() || ''
      const modelDesc = model?.description.toLowerCase() || ''
      const modelFullDesc = model?.fullDescription.toLowerCase() || ''
      const manufacturerDesc = manufacturer?.description.toLowerCase() || ''
      const constructionInterval = (vehicle?.constructionInterval || model?.constructionInterval || '').toLowerCase()

      // Поиск в атрибутах
      const attributesMatch = vehicle?.attributes?.some((attr) =>
        attr.displayTitle.toLowerCase().includes(query) ||
        attr.displayValue.toLowerCase().includes(query) ||
        attr.attributeGroup.toLowerCase().includes(query) ||
        attr.attributeType.toLowerCase().includes(query)
      ) || false

      return (
        linkageId.includes(query) ||
        linkageTypeId.includes(query) ||
        linkageTypeLabel.includes(query) ||
        vehicleDesc.includes(query) ||
        vehicleFullDesc.includes(query) ||
        modelDesc.includes(query) ||
        modelFullDesc.includes(query) ||
        manufacturerDesc.includes(query) ||
        constructionInterval.includes(query) ||
        attributesMatch
      )
    })
  }, [linkages, linkagesSearch, globalSearch])

  // ===== states =====

  if (isLoading) {
    return (
      <div style={{padding: 40, textAlign: 'center'}}>
        <Spin size="large"/>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{padding: 24}}>
        <Alert
          type="error"
          showIcon
          icon={<LeftCircleOutlined/>}
          // message={`Ошибка: ${error.code}`}
          description={error.message}
        />
      </div>
    )
  }

  if (!data || !article) return null

  // ===== render =====

  return (
    <Layout style={{minHeight: '100vh', background: '#f5f5f5', overflow: 'auto',}}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Link
          to={searchUrl}
          className={'header-link'}
        >
          ← Назад к поиску
        </Link>
      </Header>

      <Content
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        {/* Глобальный поиск */}
        {data && (
          <div style={{marginBottom: 24}}>
            <SearchInput
              value={globalSearch}
              onChange={(value) => setGlobalSearch(value)}
              placeholder="Поиск по всей странице (кроссы, OEM номера, характеристики, применимость)..."
            />

            {globalSearch && (
              <Text type="secondary" style={{display: 'block', marginTop: 8}}>
                Найдено: кроссы ({filteredCrosses.length}),
                OEM ({filteredOeNumbers.length}),
                характеристики ({filteredAttributes.length}),
                применимость ({filteredLinkages.length})
              </Text>
            )}
          </div>
        )}

        <Row gutter={[24, 24]}>
          {/* Основная информация */}
          <Col xs={24} lg={16}>
            <MainInfo
              article={article}
              supplier={supplier}
            />
            {/* Атрибуты */}
            {attributes.length > 0 && (
              <Characteristics
                filteredAttributes={filteredAttributes}
                attributesSearch={attributesSearch}
                globalSearch={globalSearch}
                attributesLength={attributes.length}
                setAttributesSearch={setAttributesSearch}
              />
            )}

            {/* Кроссы */}
            <Cross
              crossesLength={crosses.length}
              crossesSearch={crossesSearch}
              filteredCrosses={filteredCrosses}
              globalSearch={globalSearch}
              setCrossesSearch={setCrossesSearch}
            />

            {/* OEM номера */}
            <OEMNumbers
              filteredOeNumbers={filteredOeNumbers}
              globalSearch={globalSearch}
              oeNumbersSearch={oeNumbersSearch}
              oeNumbersLength={oeNumbers.length}
              setOeNumbersSearch={setOeNumbersSearch}
            />

            {/* EAN коды */}
            <EANCodes
              eanCodes={eanCodes}
            />

            {/* Дополнительная информация */}
            <AdditionalInfo
              information={information}
            />

            {/* Применимость - компактная таблица */}
            {linkages.length > 0 && (
              <ApplicabilityTable
                linkagesLength={linkages.length}
                filteredLinkages={filteredLinkages}
                globalSearch={globalSearch}
                linkagesSearch={linkagesSearch}
                setLinkagesSearch={setLinkagesSearch}
                getLinkageTypeLabel={getLinkageTypeLabel}
              />
            )}
          </Col>

          {/* Боковая панель */}
          <Col xs={24} lg={8}>

            {/* Изображения */}
            <ImgInfo
              images={images}
              supplierIdNum={supplierId}
            />

            {/* Применимость - краткая информация */}
            <ApplicabilityShortInfo linkagesLength={linkages.length}/>

            {/* Аксессуары */}
            <Accessories
              accessories={accessories}
              url={DEFAULT_URL}
            />

            {/* Новые номера */}
            <NewNumbers
              newNumbers={newNumbers}
              url={DEFAULT_URL}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}

