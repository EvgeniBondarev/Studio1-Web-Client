import type {ArticleSearchRequest} from '../api/types.ts';

export interface SearchHistoryItem {
  id: string
  query: string
  supplierId?: number
  supplierName?: string
  timestamp: number
  sortBy?: 'relevance' | 'foundString' | 'description'
  sortDescending?: boolean
}

const STORAGE_KEY = 'articleSearchHistory'
const MAX_HISTORY_ITEMS = 20

/**
 * Сохраняет поисковый запрос в историю
 */
export function saveSearchToHistory(request: ArticleSearchRequest, supplierName?: string): void {
  if (typeof window === 'undefined' || !request.query) {
    return
  }

  try {
    const history = getSearchHistory()
    
    // Создаем новый элемент истории
    const newItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: request.query,
      supplierId: request.supplierId,
      supplierName,
      timestamp: Date.now(),
      sortBy: request.sortBy,
      sortDescending: request.sortDescending,
    }

    // Удаляем дубликаты (одинаковый запрос и поставщик)
    const filteredHistory = history.filter(
      (item) => !(item.query === newItem.query && item.supplierId === newItem.supplierId)
    )

    // Добавляем новый элемент в начало
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
  } catch (e) {
    // Игнорируем ошибки сохранения
    console.error('Failed to save search history:', e)
  }
}

/**
 * Получает историю поиска
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as SearchHistoryItem[]
    }
  } catch (e) {
    console.error('Failed to load search history:', e)
  }

  return []
}

/**
 * Удаляет элемент из истории
 */
export function removeSearchFromHistory(id: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const history = getSearchHistory()
    const filteredHistory = history.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory))
  } catch (e) {
    console.error('Failed to remove search history item:', e)
  }
}

/**
 * Очищает всю историю поиска
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear search history:', e)
  }
}

/**
 * Преобразует элемент истории в запрос поиска
 */
export function historyItemToSearchRequest(item: SearchHistoryItem): ArticleSearchRequest {
  return {
    query: item.query,
    supplierId: item.supplierId,
    sortBy: item.sortBy || 'relevance',
    sortDescending: item.sortDescending || false,
    page: 1,
    pageSize: 20,
  }
}

