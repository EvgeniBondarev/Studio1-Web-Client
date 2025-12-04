import axios from 'axios'
import { message } from 'antd'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type { ODataListResponse } from './types.ts'

export interface ODataQueryOptions {
  filter?: string
  orderBy?: string
  select?: string
  expand?: string
  top?: number
  skip?: number
}

const baseURL = 'http://studio-api.interparts.ru/odata' // 'http://localhost:7091/odata'
const apiToken = '9IknRw3KF1aMeNZoZxWQYrWlOPn4Ivbt'

const client: AxiosInstance = axios.create({
  baseURL, 
  paramsSerializer: (params: Record<string, any>) => {
    // Сериализуем параметры для OData: пробелы как + вместо %20
    const parts: string[] = []
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        const strValue = String(value)
        // Кодируем все специальные символы, но пробелы заменяем на +
        const encodedValue = encodeURIComponent(strValue).replace(/%20/g, '+')
        parts.push(`${encodeURIComponent(key)}=${encodedValue}`)
      }
    }
    return parts.join('&')
  },
})

client.interceptors.request.use((config) => {
  config.headers = config.headers ?? {}
  config.headers['Accept'] = 'application/json'
  if (apiToken) {
    config.headers['Authorization'] = `Bearer ${apiToken}`
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Обработка ошибки 403 Forbidden
    if (error.response?.status === 403) {
      message.error('Ваш IP-адрес не доступен для использования данного сервиса', 8)
      return Promise.reject(error)
    }

    // Обработка CORS ошибок
    // CORS ошибки обычно приходят без response (error.response === undefined)
    // и с кодом ERR_NETWORK или Network Error в сообщении
    if (
      !error.response &&
      error.config &&
      (error.code === 'ERR_NETWORK' ||
        error.message?.toLowerCase().includes('network error') ||
        error.message?.toLowerCase().includes('cors') ||
        (error.request && !error.response))
    ) {
      // Проверяем, что запрос идет к внешнему домену (не к текущему origin)
      // Это указывает на возможную CORS ошибку
      try {
        if (error.config.baseURL || error.config.url) {
          const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
          const requestUrl = new URL(
            error.config.url || '',
            error.config.baseURL || currentOrigin || 'http://localhost',
          )
          
          // Если запрос к другому домену и нет response - это скорее всего CORS
          if (requestUrl.origin !== currentOrigin && currentOrigin) {
            message.error('Ваш IP-адрес не доступен для использования данного сервиса', 8)
            return Promise.reject(error)
          }
        }
      } catch (e) {
        // Если не удалось определить URL, но есть признаки CORS ошибки, показываем сообщение
        if (error.code === 'ERR_NETWORK' || error.message?.toLowerCase().includes('cors')) {
          message.error('Ваш IP-адрес не доступен для использования данного сервиса', 8)
          return Promise.reject(error)
        }
      }
    }

    // Пробрасываем остальные ошибки дальше
    return Promise.reject(error)
  },
)

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
  
  // Добавляем $count только если есть хотя бы один параметр запроса
  const hasAnyParam = options.filter || options.orderBy || options.select || options.expand || options.top !== undefined || options.skip !== undefined
  if (hasAnyParam) {
  params['$count'] = 'true'
  }

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

  async fetchByUrl<T>(url: string, config?: AxiosRequestConfig) {
    const response = await client.get<T>(url, config)
    return response.data
  },
}