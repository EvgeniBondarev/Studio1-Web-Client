import {useEffect, useMemo, useState} from 'react'
import { Link, useParams } from 'react-router-dom'
import {Spin, Alert, Layout, Row, Col, Card, Typography, Divider, Input} from 'antd'
import {FileImageOutlined, LeftCircleOutlined, LinkOutlined} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import {articleService} from '../../../../api/TecDoc/api/services/article.service.ts';
import '../../tecDoc.css'
import {PaginatedTable} from '../../../ui/paginated-table.tsx'
import {ExpandableLinkageRow} from '../../../ui/expandable-linkage-row.tsx'

import {SearchInput} from '../../../ui/search-input.tsx';
const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout

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
// Функция для создания URL артикула
// Для catch-all routes Next.js автоматически обрабатывает слэши в пути
function createArticleUrl(supplierId: number, articleNumber: string): string {
  return `/articles/${supplierId}/${articleNumber}`
}

// ================= page =================

export const ArticleDetailPage=()=> {

  const { supplierId, articleNumber } = useParams()

  const supplierIdNum = Number(supplierId)

  // Состояние для URL поиска с сохраненными параметрами
  const [searchUrl, setSearchUrl] = useState('/tecdoc/search/articles')

  // Восстанавливаем URL поиска из sessionStorage при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
          setSearchUrl(queryString ? `/tecdoc/search/articles?${queryString}` : '/tecdoc/search/articles')
        }
      } catch (e) {
        // Игнорируем ошибки
      }
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
    return <div style={{ padding: 24 }}>Неверный путь</div>
  }

  const { data, isLoading, error } = useQuery({
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
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          showIcon
          icon={<LeftCircleOutlined />}
          // message={`Ошибка: ${error.code}`}
          description={error.message}
        />
      </div>
    )
  }

  if (!data || !article) return null

  // ===== render =====

  function FlagItem({
                      label,
                      value,
                      trueColor = '#1890ff',
                      falseColor = '#d9d9d9',
                    }: {
    label: string
    value: boolean
    trueColor?: string
    falseColor?: string
  }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: value ? trueColor : falseColor,
          display: 'inline-block',
        }}
      />
        <Text style={{ fontSize: 13 }}>
          {label}: {value ? 'Да' : 'Нет'}
        </Text>
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5',   overflow: 'auto', }}>
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
          <div style={{ marginBottom: 24 }}>
            <SearchInput
              value={globalSearch}
              onChange={(value) => setGlobalSearch(value)}
              placeholder="Поиск по всей странице (кроссы, OEM номера, характеристики, применимость)..."
            />

            {globalSearch && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
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
            <Card>
              {/* Заголовок */}
              <Title level={3} style={{ marginBottom: 8 }}>
                {article.dataSupplierArticleNumber}
              </Title>

              {supplier && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    Поставщик: {supplier.description}
                  </Text>

                  {supplier.matchcode && (
                    <div>
                      <Text type="secondary">
                        Код: {supplier.matchcode}
                      </Text>
                    </div>
                  )}

                  {supplier.dataVersion && (
                    <div>
                      <Text type="secondary">
                        Версия данных: {supplier.dataVersion}
                      </Text>
                    </div>
                  )}

                  {supplier.nbrOfArticles !== undefined && (
                    <div>
                      <Text type="secondary">
                        Артикулов: {supplier.nbrOfArticles.toLocaleString()}
                      </Text>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ marginBottom: 8 }}>
                  Описание
                </Title>
                <Paragraph style={{ color: '#595959' }}>
                  {article.normalizedDescription || article.description}
                </Paragraph>
              </div>

              {/* Дополнительное описание */}
              {article.description &&
                article.description !== article.normalizedDescription && (
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      Дополнительное описание
                    </Title>
                    <Paragraph style={{ color: '#8c8c8c' }}>
                      {article.description}
                    </Paragraph>
                  </div>
                )}

              <Divider />

              {/* Основные характеристики */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Found String:</Text>
                  <div>
                    <Text
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 13,
                        color: '#262626',
                      }}
                    >
                      {article.foundString}
                    </Text>
                  </div>
                </Col>

                {article.quantityPerPackingUnit !== undefined && (
                  <Col span={12}>
                    <Text type="secondary">Количество в упаковке:</Text>
                    <div>
                      <Text strong>
                        {article.quantityPerPackingUnit} шт.
                      </Text>
                    </div>
                  </Col>
                )}

                <Col span={12}>
                  <Text type="secondary">Статус:</Text>
                  <div>
                    <Text strong>{article.articleStateDisplayValue}</Text>
                  </div>
                </Col>

                <Col span={12}>
                  <Text type="secondary">Supplier ID:</Text>
                  <div>
                    <Text strong>{article.supplierId}</Text>
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Флаги */}
              <div>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Флаги
                </Title>

                <Row gutter={[16, 12]}>
                  <Col span={8}>
                    <FlagItem label="Валидный" value={article.flags.isValid}
                      trueColor="#52c41a"
                      falseColor="#ff4d4f"
                    />
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Аксессуар" value={article.flags.flagAccessory}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Сертификация" value={article.flags.flagMaterialCertification}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Восстановленный" value={article.flags.flagRemanufactured}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Самообслуживание" value={article.flags.flagSelfServicePacking}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Легковой" value={article.flags.hasPassengerCar}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Коммерческий" value={article.flags.hasCommercialVehicle}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Мотоцикл" value={article.flags.hasMotorbike}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Ось" value={article.flags.hasAxle}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Двигатель" value={article.flags.hasEngine}/>
                  </Col>

                  <Col span={8}>
                    <FlagItem label="Применимость" value={article.flags.hasLinkItems}/>
                  </Col>
                </Row>
              </div>
            </Card>
            {/* Атрибуты */}
            {attributes.length > 0 && (
              <Card style={{marginBottom: 24,}}>
                {/* CardHeader */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Характеристики ({filteredAttributes.length}
                    {attributesSearch || globalSearch ? ` из ${attributes.length}` : ''})
                  </Typography.Title>
                </div>

                {/* CardContent */}
                <div style={{padding: 24,}}>
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      value={attributesSearch}
                      onChange={(e) => setAttributesSearch(e.target.value)}
                      placeholder="Поиск по ID, описанию, заголовку, значению..."
                      allowClear
                    />
                  </div>

                  {filteredAttributes.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{width: '100%', borderCollapse: 'collapse',}}>
                        <thead>
                        <tr
                          style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#fafafa',
                          }}
                        >
                          <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                            ID
                          </th>
                          <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                            Описание
                          </th>
                          <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                            Заголовок
                          </th>
                          <th style={{textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                            Значение
                          </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAttributes.map((attr) => (
                          <tr
                            key={attr.id}
                            style={{
                              borderBottom: '1px solid #f3f4f6',
                              cursor: 'default',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = '#fafafa')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = 'transparent')
                            }
                          >
                            <td style={{padding: '8px 12px', fontSize: 12, color: '#6b7280',}}>
                              {attr.id}
                            </td>
                            <td style={{padding: '8px 12px', fontSize: 12, color: '#374151',}}>
                              {attr.description}
                            </td>
                            <td style={{padding: '8px 12px', fontSize: 12, color: '#374151',}}>
                              {attr.displayTitle || '-'}
                            </td>
                            <td style={{padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#111827',}}>
                              {attr.displayValue}
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  ) : attributesSearch || globalSearch ? (
                    <p style={{color: '#6b7280', fontSize: 12, textAlign: 'center', padding: '32px 0',}}>
                      По запросу &quot;{attributesSearch || globalSearch}&quot; ничего не
                      найдено
                    </p>
                  ) : (
                    <p style={{color: '#6b7280', fontSize: 12,}}>
                      Характеристики не найдены
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Кроссы */}
            <Card style={{marginBottom: 24,}}>
              {/* CardHeader */}
              <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
                <Typography.Title
                  level={4}
                  style={{ margin: 0 }}
                >
                  Аналоги (кроссы) ({filteredCrosses.length}
                  {crossesSearch || globalSearch ? ` из ${crosses.length}` : ''})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <div
                style={{
                  padding: 24,
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Input
                    value={crossesSearch}
                    onChange={(e) => setCrossesSearch(e.target.value)}
                    placeholder="Поиск по номеру артикула, производителю..."
                    allowClear
                  />
                </div>

                {filteredCrosses.length > 0 ? (
                  <PaginatedTable
                    items={filteredCrosses}
                    itemsPerPage={20}
                    showAllThreshold={30}
                    headers={
                      <thead>
                      <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa',}}>
                        <th style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                          №
                        </th>
                        <th style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                          Номер артикула
                        </th>
                        <th style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                          Производитель
                        </th>
                        <th style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                          ID производителя
                        </th>
                      </tr>
                      </thead>
                    }
                    renderRow={(cross, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'default',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#fafafa')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                      >
                        <td style={{padding: '12px 16px', fontSize: 12, color: '#6b7280',}}>
                          {idx + 1}
                        </td>

                        <td style={{padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#111827', fontFamily: 'monospace',}}>
                          {cross.oeNbr || cross.oENbr || '—'}
                        </td>

                        <td style={{padding: '12px 16px', fontSize: 12,}}>
                          {cross.manufacturer ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                fontWeight: 500,
                              }}
                            >
                  {cross.manufacturer.description}
                </span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>—</span>
                          )}
                        </td>

                        <td style={{padding: '12px 16px', fontSize: 12, color: '#6b7280',}}>
                          {cross.manufacturerId}
                        </td>
                      </tr>
                    )}
                  />
                ) : (
                  <p style={{color: '#6b7280', fontSize: 12,}}>
                    Кроссы не найдены
                  </p>
                )}
              </div>
            </Card>

            {/* OEM номера */}
            <Card style={{marginBottom: 24,}}>
              {/* CardHeader */}
              <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  OEM номера ({filteredOeNumbers.length}
                  {oeNumbersSearch || globalSearch ? ` из ${oeNumbers.length}` : ''})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <div style={{padding: 24,}}>
                <div style={{ marginBottom: 16 }}>
                  <Input
                    value={oeNumbersSearch}
                    onChange={(e) => setOeNumbersSearch(e.target.value)}
                    placeholder="Поиск по OEM номеру..."
                    allowClear
                  />
                </div>

                {filteredOeNumbers.length > 0 ? (
                  <PaginatedTable
                    items={filteredOeNumbers}
                    itemsPerPage={20}
                    showAllThreshold={30}
                    headers={
                      <thead>
                      <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa',}}>
                        <th style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                          №
                        </th>
                        <th style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                          OEM номер
                        </th>
                        <th style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}>
                          Тип
                        </th>
                      </tr>
                      </thead>
                    }
                    renderRow={(oe, idx) => (
                      <tr
                        key={idx}
                        style={{borderBottom: '1px solid #f3f4f6', cursor: 'default',}}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#fafafa')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                      >
                        <td style={{padding: '12px 16px', fontSize: 12, color: '#6b7280',}}>
                          {idx + 1}
                        </td>

                        <td style={{padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#111827', fontFamily: 'monospace',}}>
                          {oe.oeNbr || oe.oENbr || '—'}
                        </td>

                        <td style={{padding: '12px 16px', fontSize: 12,}}>
                          {oe.isAdditive ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                  Добавка
                </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                  Основной номер
                </span>
                          )}
                        </td>
                      </tr>
                    )}
                  />
                ) : oeNumbersSearch || globalSearch ? (
                  <p style={{color: '#6b7280', fontSize: 12, textAlign: 'center', padding: '32px 0',}}>
                    По запросу &quot;{oeNumbersSearch || globalSearch}&quot; ничего не найдено
                  </p>
                ) : (
                  <p style={{color: '#6b7280', fontSize: 12,}}>
                    OEM номера не найдены
                  </p>
                )}
              </div>
            </Card>

            {/* EAN коды */}
            <Card style={{marginBottom: 24,}}>
              {/* CardHeader */}
              <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  EAN коды ({eanCodes.length})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <div style={{ padding: 24 }}>
                {eanCodes.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {eanCodes.map((ean, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          backgroundColor: '#f3f4f6',
                          padding: '4px 12px',
                          borderRadius: 4,
                          border: '1px solid #e5e7eb',
                        }}
                      >
            {ean.ean}
          </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 12 }}>EAN коды не найдены</p>
                )}
              </div>
            </Card>

            {/* Дополнительная информация */}
            <Card style={{marginBottom: 24,}}>
              {/* CardHeader */}
              <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Дополнительная информация ({information.length})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <div style={{ padding: 24 }}>
                {information.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {information.map((info, idx) => (
                      <div
                        key={idx}
                        style={{borderLeft: '4px solid #3b82f6', paddingLeft: 16,}}
                      >
                        <div
                          style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,}}>
                          <h4 style={{fontWeight: 600, color: '#111827', margin: 0, fontSize: 14,}}>
                            {info.informationType}
                          </h4>
                          <span style={{fontSize: 10, color: '#6b7280',}}>
                (Ключ: {info.informationTypeKey})
              </span>
                        </div>
                        <p style={{color: '#374151', fontSize: 12, whiteSpace: 'pre-wrap', margin: 0,}}>
                          {info.informationText}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 12 }}>
                    Дополнительная информация отсутствует
                  </p>
                )}
              </div>
            </Card>

            {/* Применимость - компактная таблица */}
            {linkages.length > 0 && (
              <Card id="linkages-table" style={{ marginBottom: 24 }}>
                {/* CardHeader */}
                <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8,}}>
                  <LinkOutlined  style={{ width: 20, height: 20 }} />
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Применимость ({filteredLinkages.length}
                    {linkagesSearch || globalSearch ? ` из ${linkages.length}` : ''})
                  </Typography.Title>
                </div>

                {/* CardContent */}
                <div style={{ padding: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      value={linkagesSearch}
                      onChange={(e) => setLinkagesSearch(e.target.value)}
                      placeholder="Поиск по типу, ID, транспортному средству, модели, производителю, характеристикам..."
                      allowClear
                    />
                  </div>

                  {filteredLinkages.length > 0 ? (
                    <PaginatedTable
                      items={filteredLinkages}
                      itemsPerPage={20}
                      showAllThreshold={50}
                      headers={
                        <thead>
                        <tr style={{borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa',}}>
                          {[
                            '№',
                            'Тип',
                            'ID',
                            'Транспортное средство',
                            'Производитель / Модель',
                            'Период',
                            'Характеристики',
                          ].map((header, idx) => (
                            <th
                              key={idx}
                              style={{textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#4b5563', fontSize: 12,}}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                        </thead>
                      }
                      renderRow={(linkage, idx) => (
                        <ExpandableLinkageRow
                          key={`linkage-${idx}`}
                          linkage={linkage}
                          index={idx}
                          getLinkageTypeLabel={getLinkageTypeLabel}
                        />
                      )}
                    />
                  ) : linkagesSearch || globalSearch ? (
                    <p style={{color: '#6b7280', fontSize: 12, textAlign: 'center', padding: '32px 0',}}>
                      По запросу &quot;{linkagesSearch || globalSearch}&quot; ничего не найдено
                    </p>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: 12 }}>
                      Применимость не найдена
                    </p>
                  )}
                </div>
              </Card>
            )}
          </Col>

          {/* Боковая панель */}
          <Col xs={24} lg={8}>

            {/* Изображения */}
            <Card style={{ marginBottom: 24 }}>
              {/* CardHeader */}
              <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8,}}>
                <FileImageOutlined style={{ width: 20, height: 20 }} />
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Изображения ({images.length})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <h1>IMAGES</h1>
              {/*<div style={{ padding: 24 }}>*/}
              {/*  {images.length > 0 ? (*/}
              {/*    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>*/}
              {/*      {images.map((img, idx) => (*/}
              {/*        <ArticleImage*/}
              {/*          key={idx}*/}
              {/*          image={img}*/}
              {/*          supplierId={supplierIdNum}*/}
              {/*        />*/}
              {/*      ))}*/}
              {/*    </div>*/}
              {/*  ) : (*/}
              {/*    <p style={{ color: '#6b7280', fontSize: 12 }}>Изображения не найдены</p>*/}
              {/*  )}*/}
              {/*</div>*/}
            </Card>

            {/* Применимость - краткая информация */}
            <Card style={{ marginBottom: 24 }}>
              {/* CardHeader */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <LinkOutlined style={{ width: 20, height: 20 }} />
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Применимость ({linkages.length})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <div style={{ padding: 24 }}>
                {linkages.length > 0 ? (
                  <>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                      Найдено <span style={{ fontWeight: 600 }}>{linkages.length}</span> применений
                    </p>
                    <a
                      href="#linkages-table"
                      style={{
                        fontSize: 12,
                        color: '#2563eb',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      Посмотреть таблицу →
                    </a>
                  </>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 12 }}>Применимость не найдена</p>
                )}
              </div>
            </Card>

            {/* Аксессуары */}
            <Card style={{ marginBottom: 24 }}>
              {/* CardHeader */}
              <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Аксессуары ({accessories.length})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <div style={{ padding: 24 }}>
                {accessories.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {accessories.map((acc, idx) => (
                      <div
                        key={idx}
                        style={{padding: 8, border: '1px solid #d9d9d9', borderRadius: 4,}}
                      >
                        <a
                          href={createArticleUrl(acc.accSupplierId, acc.accDataSupplierArticleNumber)}
                          style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                          {acc.accDataSupplierArticleNumber}
                        </a>
                        <p style={{ fontSize: 10, color: '#6b7280', margin: '4px 0 0 0' }}>
                          Supplier ID: {acc.accSupplierId}
                        </p>
                        {acc.accSupplier && (
                          <div style={{ marginTop: 4, fontSize: 12, color: '#374151' }}>
                            <p style={{ margin: 0 }}>{acc.accSupplier.description}</p>
                            {acc.accSupplier.matchcode && (
                              <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0 0' }}>
                                Код: {acc.accSupplier.matchcode}
                              </p>
                            )}
                            {acc.accSupplier.dataVersion && (
                              <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0 0' }}>
                                Версия: {acc.accSupplier.dataVersion}
                              </p>
                            )}
                            {acc.accSupplier.nbrOfArticles !== undefined && (
                              <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0 0' }}>
                                Артикулов: {acc.accSupplier.nbrOfArticles.toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 12 }}>Аксессуары не найдены</p>
                )}
              </div>
            </Card>

            {/* Новые номера */}
            <Card style={{ marginBottom: 24 }}>
              {/* CardHeader */}
              <div style={{padding: '16px 24px', borderBottom: '1px solid #f0f0f0',}}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Новые номера ({newNumbers.length})
                </Typography.Title>
              </div>

              {/* CardContent */}
              <div style={{ padding: 24 }}>
                {newNumbers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {newNumbers.map((newNum, idx) => (
                      <div
                        key={idx}
                        style={{padding: 8, border: '1px solid #d9d9d9', borderRadius: 4,}}
                      >
                        <a
                          href={createArticleUrl(newNum.newSupplierId, newNum.newDataSupplierArticleNumber)}
                          style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                          {newNum.newDataSupplierArticleNumber}
                        </a>
                        <p style={{ fontSize: 10, color: '#6b7280', margin: '4px 0 0 0' }}>
                          Supplier ID: {newNum.newSupplierId}
                        </p>
                        {newNum.newSupplier && (
                          <div style={{ marginTop: 4, fontSize: 12, color: '#374151' }}>
                            <p style={{ margin: 0 }}>{newNum.newSupplier.description}</p>
                            {newNum.newSupplier.matchcode && (
                              <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0 0' }}>
                                Код: {newNum.newSupplier.matchcode}
                              </p>
                            )}
                            {newNum.newSupplier.dataVersion && (
                              <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0 0' }}>
                                Версия: {newNum.newSupplier.dataVersion}
                              </p>
                            )}
                            {newNum.newSupplier.nbrOfArticles !== undefined && (
                              <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0 0' }}>
                                Артикулов: {newNum.newSupplier.nbrOfArticles.toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 12 }}>Новые номера не найдены</p>
                )}
              </div>
            </Card>


          </Col>
        </Row>






      </Content>
    </Layout>
  )
}

