import { odataClient, escapeODataValue, type ODataQueryOptions } from './odataClient.ts'
import type { EtProducer, ODataListResponse } from './types.ts'

const PRODUCERS_PAGE_SIZE = 100

const buildProducerFilter = (search?: string, filterMode?: 'all' | 'originals' | 'non-originals' | 'with-prefix') => {
  const conditions: string[] = []

  // Проверяем, что search не пустая строка
  if (search && search.trim()) {
    conditions.push(
      `(contains(Name,'${escapeODataValue(search)}') or contains(MarketPrefix,'${escapeODataValue(search)}'))`,
    )
  }

  if (filterMode === 'originals') {
    conditions.push('(Id eq RealId)')
  } else if (filterMode === 'non-originals') {
    conditions.push('(Id ne RealId)')
  } else if (filterMode === 'with-prefix') {
    conditions.push('(MarketPrefix ne null and MarketPrefix ne \'\')')
  }

  if (!conditions.length) {
    return undefined
  }

  return conditions.length === 1 ? conditions[0] : conditions.map((condition) => `(${condition})`).join(' and ')
}

export interface ProducersPageResult {
  items: EtProducer[]
  total?: number
  nextLink?: string
}

interface FetchProducersOptions {
  filterMode?: 'all' | 'originals' | 'non-originals' | 'with-prefix'
}

export const fetchProducersPage = async (
  search?: string,
  nextLink?: string,
  options?: FetchProducersOptions,
): Promise<ProducersPageResult | undefined> => {
  // Если есть nextLink, используем его (для пагинации)
  if (nextLink) {
    const response = await odataClient.fetchByUrl<ODataListResponse<EtProducer>>(nextLink)
    return {
      items: response.value,
      total: response['@odata.count'],
      nextLink: response['@odata.nextLink'],
    }
  }

  // Для первой страницы: если нет поиска и фильтра, делаем запрос без параметров
  const hasSearch = search && search.trim()
  const hasFilter = options?.filterMode && options.filterMode !== 'all'

  if (!hasSearch && !hasFilter) {
    // Запрос без параметров - список производителей с сортировкой по названию
    const response = await odataClient.list<EtProducer>('Producers', {
      orderBy: 'Name',
      top: PRODUCERS_PAGE_SIZE,
    })
    return {
      items: response.value,
      total: response['@odata.count'],
      nextLink: response['@odata.nextLink'],
    }
  }

  // Если есть поиск или фильтр, применяем фильтрацию с параметрами
  const filter = buildProducerFilter(search, options?.filterMode)
  const queryOptions: ODataQueryOptions = {
    orderBy: 'Name',
        top: PRODUCERS_PAGE_SIZE,
  }
  if (filter) {
    queryOptions.filter = filter
  }

  const response = await odataClient.list<EtProducer>('Producers', queryOptions)
  return {
    items: response.value,
    total: response['@odata.count'],
    nextLink: response['@odata.nextLink'],
  }
}

export const createProducer = (payload: Partial<EtProducer>) =>
  odataClient.create<EtProducer>('Producers', payload)

export const updateProducer = (id: number, payload: Partial<EtProducer>) =>
  odataClient.update<EtProducer>('Producers', id, payload)

export const deleteProducer = (id: number) => odataClient.remove('Producers', id)

export const fetchProducerById = (id: number) => odataClient.getById<EtProducer>('Producers', id)

export const linkProducers = async (producerIds: number[], targetProducerId: number): Promise<void> => {
  // Обновляем RealId для всех выделенных производителей
  const updatePromises = producerIds.map((producerId) =>
    updateProducer(producerId, { RealId: targetProducerId })
  )
  await Promise.all(updatePromises)
}

