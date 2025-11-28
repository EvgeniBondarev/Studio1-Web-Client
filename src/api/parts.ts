import { odataClient, type ODataQueryOptions } from './odataClient.ts'
import type { EtPart, EtStringEntry, ODataListResponse } from './types.ts'

const PARTS_PAGE_SIZE = 200

const buildPartsFilter = (producerId: number) => `ProducerId eq ${producerId}`

export interface PartsPageResult {
  items: EtPart[]
  total?: number
  nextLink?: string
}

export const fetchPartsPage = async (producerId: number, nextLink?: string): Promise<PartsPageResult> => {
  const response = nextLink
    ? await odataClient.fetchByUrl<ODataListResponse<EtPart>>(nextLink)
    : await odataClient.list<EtPart>('Parts', {
        filter: buildPartsFilter(producerId),
        orderBy: 'LongCode',
        top: PARTS_PAGE_SIZE,
      } satisfies ODataQueryOptions)

  return {
    items: response.value,
    total: response['@odata.count'],
    nextLink: response['@odata.nextLink'],
  }
}

export const fetchPartsPageWithoutProducer = async (
  searchTerm?: string,
  filterMode: 'exact' | 'startsWith' | 'endsWith' | 'contains' = 'exact',
  nextLink?: string,
): Promise<PartsPageResult> => {
  const escapedTerm = searchTerm ? searchTerm.replace(/'/g, "''") : undefined

  let filter: string | undefined
  if (escapedTerm) {
    switch (filterMode) {
      case 'startsWith':
        filter = `startsWith(Code,'${escapedTerm}')`
        break
      case 'endsWith':
        filter = `endsWith(Code,'${escapedTerm}')`
        break
      case 'contains':
        filter = `contains(Code,'${escapedTerm}')`
        break
      default:
        filter = `Code eq '${escapedTerm}'`
    }
  }

  const response = nextLink
    ? await odataClient.fetchByUrl<ODataListResponse<EtPart>>(nextLink)
    : await odataClient.list<EtPart>('Parts', {
        filter,
        orderBy: 'LongCode',
        top: PARTS_PAGE_SIZE,
      } satisfies ODataQueryOptions)

  return {
    items: response.value,
    total: response['@odata.count'],
    nextLink: response['@odata.nextLink'],
  }
}

export const fetchPartsCount = async (producerId: number) => {
  const data = await odataClient.list<EtPart>('Parts', {
    filter: buildPartsFilter(producerId),
    top: 0,
  })
  return data['@odata.count'] ?? 0
}

export const fetchStringsByIds = async (
  producerId: number,
  ids: Array<number | undefined>,
  chunkSize = 5,
): Promise<Record<number, string>> => {
  const validIds = Array.from(new Set(ids.filter((id): id is number => typeof id === 'number')))
  if (!validIds.length) {
    return {}
  }

  const result: Record<number, string> = {}

  for (let index = 0; index < validIds.length; index += chunkSize) {
    const chunk = validIds.slice(index, index + chunkSize)
    const idFilter = chunk.map((id) => `IdStr eq ${id}`).join(' or ')
    const filter = `(ProducerId eq ${producerId}) and (${idFilter})`

    const options: ODataQueryOptions = {
      filter,
      select: 'IdStr,Text',
      top: chunk.length,
    }

    const response = await odataClient.list<EtStringEntry>('Strings', options)
    response.value.forEach((entry) => {
      if (typeof entry.IdStr === 'number') {
        const text = entry.Text?.trim()
        if (text) {
          result[entry.IdStr] = text
        }
      }
    })
  }

  return result
}

export const createPart = (payload: Partial<EtPart>) => odataClient.create<EtPart>('Parts', payload)

export const updatePart = (id: number, payload: Partial<EtPart>) =>
  odataClient.update<EtPart>('Parts', id, payload)

export const deletePart = (id: number) => odataClient.remove('Parts', id)


