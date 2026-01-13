import axios, {type AxiosInstance, AxiosError, type AxiosRequestConfig } from 'axios'
import {API_CONFIG} from '../config.ts';
import type {ErrorResponse} from './types.ts';

export class ApiError extends Error {
  public code: string
  public statusCode: number
  public path?: string
  public timestamp?: string

  constructor(
    code: string,
    message: string,
    statusCode: number,
    path?: string,
    timestamp?: string
  ) {
    super(message)
    this.name = 'ApiError'

    this.code = code
    this.statusCode = statusCode
    this.path = path
    this.timestamp = timestamp
  }
}

class RateLimiter {
  private requests: number[] = []
  private readonly limit: number
  private readonly window: number

  constructor(limit: number, window: number) {
    this.limit = limit
    this.window = window
  }

  async checkLimit(): Promise<void> {
    const now = Date.now()
    // Удаляем старые запросы вне окна
    this.requests = this.requests.filter(time => now - time < this.window)

    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0]
      const waitTime = this.window - (now - oldestRequest)
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    this.requests.push(now)
  }
}

class ApiClient {
  private client: AxiosInstance
  private apiRateLimiter: RateLimiter
  private searchRateLimiter: RateLimiter

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: API_CONFIG.timeouts.elasticsearch,
    })

    this.apiRateLimiter = new RateLimiter(
      API_CONFIG.rateLimit.api.limit,
      API_CONFIG.rateLimit.api.window
    )
    this.searchRateLimiter = new RateLimiter(
      API_CONFIG.rateLimit.search.limit,
      API_CONFIG.rateLimit.search.window
    )

    // Interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        return this.handleError(error)
      }
    )
  }

  private async handleError(error: AxiosError<ErrorResponse>): Promise<never> {
    if (!error.response) {
      throw new ApiError(
        'NETWORK_ERROR',
        'Ошибка сети. Проверьте подключение к интернету.',
        0
      )
    }

    const { status, data, headers } = error.response

    // Обработка Rate Limiting
    if (status === 429) {
      const retryAfter = headers['retry-after']
      if (retryAfter) {
        const waitTime = parseInt(retryAfter) * 1000
        await new Promise(resolve => setTimeout(resolve, waitTime))
        throw error // Повторяем запрос после ожидания
      }
    }

    const errorData = data || {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Неизвестная ошибка',
      timestamp: new Date().toISOString(),
    }

    throw new ApiError(
      errorData.code,
      errorData.message,
      status,
      errorData.path,
      errorData.timestamp
    )
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    isSearch: boolean = false
  ): Promise<T> {
    let lastError: ApiError | null = null

    for (let attempt = 0; attempt < API_CONFIG.retry.maxAttempts; attempt++) {
      try {
        // Проверка rate limit перед запросом
        if (isSearch) {
          await this.searchRateLimiter.checkLimit()
        } else {
          await this.apiRateLimiter.checkLimit()
        }

        return await requestFn()
      } catch (error) {
        if (error instanceof ApiError) {
          // Обработка Rate Limiting (429) - ждем и повторяем
          if (error.statusCode === 429) {
            lastError = error
            if (attempt < API_CONFIG.retry.maxAttempts - 1) {
              // Используем Retry-After если есть, иначе exponential backoff
              const delay = error.timestamp
                ? 10000 // 10 секунд по умолчанию для rate limit
                : API_CONFIG.retry.initialDelay *
                  Math.pow(API_CONFIG.retry.backoffMultiplier, attempt)
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }
          }

          // Не retry для клиентских ошибок (кроме 429)
          if (API_CONFIG.retry.nonRetryableStatuses.includes(error.statusCode as typeof API_CONFIG.retry.nonRetryableStatuses[number])) {
            throw error
          }

          // Retry только для временных ошибок
          if (API_CONFIG.retry.retryableStatuses.includes(error.statusCode as typeof API_CONFIG.retry.retryableStatuses[number])) {
            lastError = error
            if (attempt < API_CONFIG.retry.maxAttempts - 1) {
              const delay =
                API_CONFIG.retry.initialDelay *
                Math.pow(API_CONFIG.retry.backoffMultiplier, attempt)
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }
          }
        }

        throw error
      }
    }

    throw lastError || new ApiError('RETRY_FAILED', 'Превышено количество попыток', 500)
  }

  async get<T>(url: string, config?: AxiosRequestConfig, isSearch: boolean = false): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.get<T>(url, {
        ...config,
        timeout: isSearch
          ? API_CONFIG.timeouts.elasticsearch
          : API_CONFIG.timeouts.mysql,
      })
      return response.data
    }, isSearch)
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    isSearch: boolean = true
  ): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.post<T>(url, data, {
        ...config,
        timeout: isSearch
          ? API_CONFIG.timeouts.elasticsearch
          : API_CONFIG.timeouts.mysql,
      })
      return response.data
    }, isSearch)
  }
}

export const apiClient = new ApiClient()

