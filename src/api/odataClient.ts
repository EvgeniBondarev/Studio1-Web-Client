import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ODataListResponse } from './types.ts'

export interface ODataQueryOptions {
  filter?: string
  orderBy?: string
  select?: string
  expand?: string
  top?: number
  skip?: number
}

// ЗАШИТЫЙ URL API
const baseURL = '/api'
const apiToken = '9IknRw3KF1aMeNZoZxWQYrWlOPn4Ivbt'

const client: AxiosInstance = axios.create({
  baseURL, // Теперь запросы идут напрямую на API
})

client.interceptors.request.use((config) => {
  config.headers = config.headers ?? {}
  config.headers['Accept'] = 'application/json'
  if (apiToken) {
    config.headers['Authorization'] = `Bearer ${apiToken}`
  }

  return config
})

const buildQueryParams = (options?: ODataQueryOptions) => {
  if (!options) {
    return undefined
  }

  const params: Record<string, string | number> = {}

  if (options.filter) params['$filter'] = options.filter
  if (options.orderBy) params['$orderby'] = options.orderBy
  if (options.select) params['$select'] = options.select
  if (options.expand) params['$expand'] = options.expand
  if (options.top !== undefined) params['$top'] = options.top
  if (options.skip !== undefined) params['$skip'] = options.skip
  params['$count'] = 'true'

  return params
}

export const escapeODataValue = (value: string) => value.replace(/'/g, "''")

export const odataClient = {
  async list<T>(
    resource: string,
    options?: ODataQueryOptions,
    config?: AxiosRequestConfig,
  ): Promise<ODataListResponse<T>> {
    const response = await client.get<ODataListResponse<T>>(`/${resource}`, {
      params: buildQueryParams(options),
      ...config,
    })
    return response.data
  },

  async getById<T>(resource: string, id: number | string, config?: AxiosRequestConfig) {
    const response = await client.get<T>(`/${resource}(${id})`, config)
    return response.data
  },

  async create<T>(resource: string, payload: unknown, config?: AxiosRequestConfig) {
    const response = await client.post<T>(`/${resource}`, payload, config)
    return response.data
  },

  async update<T>(
    resource: string,
    id: number | string,
    payload: unknown,
    config?: AxiosRequestConfig,
  ) {
    const response = await client.patch<T>(`/${resource}(${id})`, payload, config)
    return response.data
  },

  async remove(resource: string, id: number | string, config?: AxiosRequestConfig) {
    await client.delete(`/${resource}(${id})`, config)
  },
}