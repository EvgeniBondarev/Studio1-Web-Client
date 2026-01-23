export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function normalizeArticleNumber(articleNumber: string): string {
  return articleNumber
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .trim()
}

