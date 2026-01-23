export const TECDOC_API_BASE_URL = 'https://tecdoc.interparts.ru'

export const API_CONFIG = {
  baseURL: TECDOC_API_BASE_URL,
  timeouts: {
    elasticsearch: 30000, // 30 секунд
    mysql: 15000, // 15 секунд
    health: 5000, // 5 секунд
  },
  retry: {
    maxAttempts: 3,
    retryableStatuses: [500, 502, 503, 504],
    nonRetryableStatuses: [400, 401, 403, 404, 429],
    backoffMultiplier: 2,
    initialDelay: 1000, // 1 секунда
  },
  cache: {
    articleSearch: 5 * 60 * 1000, // 5 минут
    articleDetail: 10 * 60 * 1000, // 10 минут
    supplierSearch: 5 * 60 * 1000, // 5 минут
  },
  rateLimit: {
    api: { limit: 100, window: 10000 }, // 100 запросов за 10 секунд
    search: { limit: 50, window: 10000 }, // 50 запросов за 10 секунд
  },
} as const

