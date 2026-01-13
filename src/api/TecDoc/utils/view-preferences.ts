const VIEW_MODE_KEY = 'searchViewMode'

export type ViewMode = 'cards' | 'rows'

/**
 * Получает сохраненный вид отображения из localStorage
 */
export function getViewMode(): ViewMode {
  if (typeof window === 'undefined') {
    return 'cards'
  }

  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === 'cards' || stored === 'rows') {
      return stored
    }
  } catch (e) {
    // Игнорируем ошибки
  }

  return 'cards'
}

/**
 * Сохраняет вид отображения в localStorage
 */
export function setViewMode(mode: ViewMode): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(VIEW_MODE_KEY, mode)
  } catch (e) {
    // Игнорируем ошибки
  }
}

