import { odataClient } from './odataClient.ts'
import { escapeODataValue } from './odataClient.ts'
import type { CtUser, CtUserDetails } from './types.ts'

export const fetchUsers = async (): Promise<CtUser[]> => {
  const allUsers: CtUser[] = []
  let nextLink: string | undefined

  do {
    const response = nextLink
      ? await odataClient.fetchByUrl<{ value: CtUser[]; '@odata.nextLink'?: string }>(nextLink)
      : await odataClient.list<CtUser>('CtUsers', { top: 100 })

    allUsers.push(...response.value)
    nextLink = response['@odata.nextLink']
  } while (nextLink)

  return allUsers
}

export const authenticateUser = async (login: string, password: string): Promise<CtUser | null> => {
  try {
    const users = await fetchUsers()
    const user = users.find((u) => u.Login === login && u.Password === password)
    return user || null
  } catch (error) {
    console.error('Failed to authenticate user:', error)
    return null
  }
}

export const fetchUserDetailsByLogin = async (login: string): Promise<CtUserDetails | null> => {
  try {
    const escapedLogin = escapeODataValue(login)
    const response = await odataClient.list<CtUserDetails>('CtUserDetails', {
      filter: `Login eq '${escapedLogin}'`,
      top: 1,
    })
    return response.value.length > 0 ? response.value[0] : null
  } catch (error) {
    console.error(`Failed to fetch user details for login ${login}:`, error)
    return null
  }
}

