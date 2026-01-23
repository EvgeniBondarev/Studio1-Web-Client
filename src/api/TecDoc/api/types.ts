// Базовые типы для запросов и ответов

export interface ErrorResponse {
  code: string
  message: string
  details?: string
  path?: string
  timestamp: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  took?: number
}

// ArticleSearch типы
export interface ArticleSearchRequest extends PaginationParams {
  query: string | null
  supplierId?: number
  sortBy?: 'relevance' | 'foundString' | 'description'
  sortDescending?: boolean
}

export interface ArticleDocument {
  id: string
  supplierId: number
  dataSupplierArticleNumber: string
  foundString: string
  normalizedDescription: string
  description?: string
  articleStateDisplayValue?: string
  quantityPerPackingUnit?: number
  supplierDescription: string
  supplierMatchcode: string
  indexedAt: string
  lastModified?: string
}

export type ArticleSearchResult = PaginatedResponse<ArticleDocument>

// SupplierSearch типы
export interface SupplierSearchRequest extends PaginationParams {
  query: string | null
  sortBy?: 'relevance' | 'description' | 'matchcode' | 'nbrOfArticles'
  sortDescending?: boolean
}

export interface SupplierDocument {
  id: string
  supplierId: number
  description: string
  matchcode: string
  dataVersion?: number
  nbrOfArticles?: number
  hasNewVersionArticles?: boolean
  indexedAt: string
  lastModified?: string
}

export type SupplierSearchResult = PaginatedResponse<SupplierDocument>

// MySQL Articles типы
export interface ArticleSearchParams {
  articleNumber: string
  supplierId?: number
}

export interface ArticleSearchResponseDto {
  count: number
  results: ArticleDto[]
}

export interface ArticleDto {
  article: ArticleInfoDto
  supplier?: SupplierInfoDto
  crosses: CrossDto[]
  oeNumbers: OeNumberDto[]
  attributes: AttributeDto[]
  images: ImageDto[]
  linkages: LinkageDto[]
  eanCodes: EanCodeDto[]
  information: InformationDto[]
  accessories: AccessoryDto[]
  newNumbers: NewNumberDto[]
}

export interface ArticleInfoDto {
  supplierId: number
  dataSupplierArticleNumber: string
  foundString: string
  normalizedDescription?: string
  description: string
  articleStateDisplayValue: string
  quantityPerPackingUnit?: number
  flags: ArticleFlagsDto
}

export interface ArticleFlagsDto {
  flagAccessory: boolean
  flagMaterialCertification: boolean
  flagRemanufactured: boolean
  flagSelfServicePacking: boolean
  hasAxle: boolean
  hasCommercialVehicle: boolean
  hasEngine: boolean
  hasLinkItems: boolean
  hasMotorbike: boolean
  hasPassengerCar: boolean
  isValid: boolean
}

export interface SupplierInfoDto {
  id: number
  description: string
  matchcode: string
  dataVersion?: number | string
  nbrOfArticles?: number
  hasNewVersionArticles?: boolean
}

export interface CrossDto {
  manufacturerId: number
  oENbr?: string
  oeNbr?: string
  manufacturer?: ManufacturerDto
}

export interface ManufacturerDto {
  id: number
  description: string
}

export interface OeNumberDto {
  oENbr?: string
  oeNbr?: string
  isAdditive: boolean
}

export interface AttributeDto {
  id: number
  description: string
  displayTitle: string
  displayValue: string
}

export interface ImageDto {
  pictureName: string
  description: string
  additionalDescription?: string
  documentName?: string
  documentType?: string
  showImmediately: boolean
}

export interface LinkageDto {
  linkageTypeId: string
  linkageId: number
  vehicle?: VehicleDto
}

export interface VehicleDto {
  id: number
  description: string
  fullDescription: string
  constructionInterval: string
  canBeDisplayed: boolean
  hasLink: boolean
  typeFlags: VehicleTypeFlagsDto
  model: VehicleModelDto
  attributes: VehicleAttributeDto[]
}

export interface VehicleTypeFlagsDto {
  isAxle: boolean
  isCommercialVehicle: boolean
  isCvManufacturerId: boolean
  isEngine: boolean
  isMotorbike: boolean
  isPassengerCar: boolean
  isTransporter: boolean
}

export interface VehicleModelDto {
  id: number
  description: string
  fullDescription: string
  constructionInterval: string
  manufacturer: ManufacturerDto
}

export interface VehicleAttributeDto {
  attributeGroup: string
  attributeType: string
  displayTitle: string
  displayValue: string
}

export interface EanCodeDto {
  ean: string
}

export interface InformationDto {
  informationTypeKey: number
  informationType: string
  informationText: string
}

export interface AccessoryDto {
  accSupplierId: number
  accDataSupplierArticleNumber: string
  accSupplier?: SupplierInfoDto
}

export interface NewNumberDto {
  newSupplierId: number
  newDataSupplierArticleNumber: string
  newSupplier?: SupplierInfoDto
}

// Health check типы
export interface HealthStatus {
  status: string
  indexExists: boolean
  indexedDocuments: number
  timestamp: string
}

