import { odataClient, escapeODataValue, type ODataQueryOptions } from './odataClient.ts'
import type { EtProducer, ODataListResponse } from './types.ts'

const PRODUCERS_PAGE_SIZE = 100

const buildProducerFilter = (search?: string, onlyOriginals?: boolean) => {
  const conditions: string[] = []

  if (search) {
    conditions.push(
      `(contains(Name,'${escapeODataValue(search)}') or contains(MarketPrefix,'${escapeODataValue(search)}'))`,
    )
  }

  if (onlyOriginals) {
    conditions.push('(Id eq RealId)')
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
  onlyOriginals?: boolean
}

export const fetchProducersPage = async (
  search?: string,
  nextLink?: string,
  options?: FetchProducersOptions,
): Promise<ProducersPageResult | undefined> => {
  const response = nextLink
    ? await odataClient.fetchByUrl<ODataListResponse<EtProducer>>(nextLink)
    : await odataClient.list<EtProducer>('Producers', {
        filter: buildProducerFilter(search, options?.onlyOriginals),
        orderBy: 'Rating desc, Name',
        top: PRODUCERS_PAGE_SIZE,
      } satisfies ODataQueryOptions)

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

