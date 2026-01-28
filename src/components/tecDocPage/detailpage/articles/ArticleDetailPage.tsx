import {useEffect, useMemo, useState} from 'react'
import { useParams} from 'react-router-dom'
import {Spin, Alert, Row, Col, Typography, Space} from 'antd'
import {LeftCircleOutlined} from '@ant-design/icons'
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
import {ROUTE_GENERATE_TEC_DOC, ROUTE_TEC_DOC} from '../../constants/routes.ts';
import type {ArticleSearchRequest} from '../../../../api/TecDoc/api/types.ts';
import {useFilteredAttributes} from '../../useFilteredAttributes.ts';
import {useArticleByExactMatch} from '../../useArticleByExactMatch.ts';
import '../../tecDoc.css'
import {PageLayout} from '../../../ui/tecDoc/PageLayout.tsx';
import {PageHeader} from '../../../ui/tecDoc/PageHeader.tsx';

const {Text} = Typography;

// ================= utils =================

// Функция для получения расшифровки типа применимости
export function getLinkageTypeLabel(typeId: string): string {
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

// ================= page =================

export const ArticleDetailPage = () => {

  const {supplierId, articleNumber} = useParams()

  const supplierIdNum = Number(supplierId)

  // Состояние для URL поиска с сохраненными параметрами
  const [searchUrl, setSearchUrl] = useState<string>(ROUTE_TEC_DOC.SEARCH_ARTICLES)

  // Восстанавливаем URL поиска из sessionStorage при монтировании
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('articleSearchParams')
      if (!saved) return

      const parsed: ArticleSearchRequest = JSON.parse(saved)

      setSearchUrl(
        ROUTE_GENERATE_TEC_DOC.articleSearch(parsed)
      )
    } catch {
      // Игнорируем ошибки
    }
  }, [])

  // ===== search states =====
  // Состояния для поиска - должны быть объявлены до любых условных возвратов
  const [globalSearch, setGlobalSearch] = useState('')
  const [crossesSearch, setCrossesSearch] = useState('')
  const [oeNumbersSearch, setOeNumbersSearch] = useState('')
  const [linkagesSearch, setLinkagesSearch] = useState('')

  if (!supplierId || !articleNumber) {
    return <div style={{padding: 24}}>Неверный путь</div>
  }

  const {
    article,
    supplier,
    images,
    information,
    eanCodes,
    accessories,
    newNumbers,
    crosses,
    oeNumbers,
    attributes,
    linkages,
    hasData,
    isLoading,
    error,
  } = useArticleByExactMatch(supplierIdNum, articleNumber)

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


  const { filteredAttributes, search: attributesSearch, setSearch: setAttributesSearch } =
    useFilteredAttributes(attributes, '', globalSearch);

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
          description={error.message}
        />
      </div>
    )
  }

  if (!hasData || !article) return null

  // ===== render =====

  return (
    <PageLayout
        maxWidth={1400}
        header={
          <PageHeader
            backLink={{
              to: searchUrl,
              label: 'Назад к поиску',
            }}
          />
        }
      >

        {/* Глобальный поиск */}
        {hasData && (
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
            <Space
              orientation="vertical"
              size="middle"
              style={{ width: '100%' }}
            >

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
              />
            )}
            </Space>
          </Col>

          {/* Боковая панель */}
          <Col xs={24} lg={8}>
            <Space
              orientation="vertical"
              size="middle"
              style={{ width: '100%' }}
            >

            {/* Изображения */}
            <ImgInfo
              images={images}
              supplierIdNum={supplierIdNum}
            />

            {/* Применимость - краткая информация */}
            <ApplicabilityShortInfo linkagesLength={linkages.length}/>

            {/* Аксессуары */}
            <Accessories
              accessories={accessories}
              url={ROUTE_TEC_DOC.SEARCH_ARTICLES}
            />

            {/* Новые номера */}
            <NewNumbers
              newNumbers={newNumbers}
              url={ROUTE_TEC_DOC.SEARCH_ARTICLES}
            />
            </Space>
          </Col>
        </Row>
    </PageLayout>
  )
}

