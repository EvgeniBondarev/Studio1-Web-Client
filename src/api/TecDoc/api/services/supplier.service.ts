import { apiClient } from '../client'
import type {SupplierInfoDto} from '../types.ts';

export interface SupplierSearchParams {
  id?: number
  matchcode?: string
}

export interface SupplierSearchResponse {
  count: number
  results: SupplierInfoDto[] | null
}

export interface SupplierDetailDto {
  addressType: string
  addressTypeId: string | number
  city1?: string
  city2?: string
  countryCode?: string
  email?: string
  fax?: string
  homepage?: string
  name1?: string
  name2?: string
  postalCodeCity?: string
  postalCodePob?: string
  postalCodeWholesaler?: string
  postalCountryCode?: string
  postOfficeBox?: string
  street1?: string
  street2?: string
  telephone?: string
}

export interface SupplierDetailResponse {
  supplier: SupplierInfoDto
  details: SupplierDetailDto[] | null
}

export class SupplierService {
  /**
   * Поиск поставщиков по matchcode или ID
   */
  async search(params: SupplierSearchParams): Promise<SupplierSearchResponse> {
    const queryParams: Record<string, string> = {}
    
    if (params.id !== undefined) {
      queryParams.id = params.id.toString()
    }
    
    if (params.matchcode) {
      queryParams.matchcode = params.matchcode
    }

    return apiClient.get<SupplierSearchResponse>(
      '/api/v1/suppliers/search',
      queryParams,
      true
    )
  }

  /**
   * Получить поставщика по ID с деталями (адреса, контакты)
   */
  async getById(id: number): Promise<SupplierDetailResponse> {
    return apiClient.get<SupplierDetailResponse>(
      `/api/v1/suppliers/${id}`,
      undefined,
      true
    )
  }
}

export const supplierService = new SupplierService()

