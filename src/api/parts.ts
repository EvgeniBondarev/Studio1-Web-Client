import { odataClient, escapeODataValue, type ODataQueryOptions } from './odataClient.ts'
import type { EtPart } from './types.ts'

export const fetchParts = async (producerId: number, search?: string) => {
  const searchFilter = search
    ? ` and (contains(Code,'${escapeODataValue(search)}') or contains(LongCode,'${escapeODataValue(
        search,
      )}') or contains(cast(Name,'Edm.String'),'${escapeODataValue(search)}'))`
    : ''

  const filter = `ProducerId eq ${producerId}${searchFilter}`

  const options: ODataQueryOptions = {
    filter,
    orderBy: 'LongCode',
    top: 200,
  }

  const data = await odataClient.list<EtPart>('Parts', options)
  return data.value
}

export const createPart = (payload: Partial<EtPart>) => odataClient.create<EtPart>('Parts', payload)

export const updatePart = (id: number, payload: Partial<EtPart>) =>
  odataClient.update<EtPart>('Parts', id, payload)

export const deletePart = (id: number) => odataClient.remove('Parts', id)


