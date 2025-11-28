import type { CtSession } from './types.ts'
import { odataClient, type ODataQueryOptions } from './odataClient.ts'

const CT_SESSIONS_PAGE_SIZE = 200

export const fetchCtSessions = async (app?: number): Promise<CtSession[]> => {
  const options: ODataQueryOptions = {
    orderBy: 'Start desc',
    top: CT_SESSIONS_PAGE_SIZE,
  }

  if (typeof app === 'number') {
    options.filter = `App eq ${app}`
  }

  const response = await odataClient.list<CtSession>('CtSessions', options)
  return response.value
}

export const fetchSessionById = async (id: number) => {
  return odataClient.getById<CtSession>('CtSessions', id)
}

