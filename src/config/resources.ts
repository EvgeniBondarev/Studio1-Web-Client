export type FieldType = 'text' | 'number' | 'url' | 'textarea'
export type SearchType = 'by_producer' | 'without_producer'

export interface FieldConfig {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  placeholder?: string
  min?: number
}

export const producerFields: FieldConfig[] = [
  { name: 'Prefix', label: 'Префикс', required: true },
  { name: 'Name', label: 'Название', required: true },
  { name: 'Domain', label: 'Домен' },
  { name: 'Www', label: 'Сайт', type: 'url' },
  { name: 'Rating', label: 'Рейтинг', type: 'number', min: 0 },
  { name: 'TecdocSupplierId', label: 'TecDoc ID', type: 'number' },
]

export const partFields: FieldConfig[] = [
  { name: 'Code', label: 'Код', required: true },
  { name: 'LongCode', label: 'Длинный код' },
  { name: 'Weight', label: 'Вес, кг', type: 'number', min: 0 },
  { name: 'Name', label: 'Идентификатор названия', type: 'number', min: 0 },
  { name: 'Description', label: 'Идентификатор описания', type: 'number', min: 0 },
  { name: 'V', label: 'Объём', type: 'number', min: 0 },
  { name: 'SessionId', label: 'Сессия', type: 'number', min: 0 },
]

