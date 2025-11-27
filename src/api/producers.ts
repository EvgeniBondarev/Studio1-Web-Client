import { odataClient, escapeODataValue, type ODataQueryOptions } from './odataClient.ts'
import type { EtProducer } from './types.ts'

export const fetchProducers = async (search?: string) => {
  const filter = search
    ? `(contains(Name,'${escapeODataValue(search)}') or contains(MarketPrefix,'${escapeODataValue(search)}'))`
    : undefined

  const options: ODataQueryOptions = {
    filter,
    orderBy: 'Rating desc, Name',
    top: 200,
  }

  const data = await odataClient.list<EtProducer>('Producers', options)
  return data.value
}

export const createProducer = (payload: Partial<EtProducer>) =>
  odataClient.create<EtProducer>('Producers', payload)

export const updateProducer = (id: number, payload: Partial<EtProducer>) =>
  odataClient.update<EtProducer>('Producers', id, payload)

export const deleteProducer = (id: number) => odataClient.remove('Producers', id)

