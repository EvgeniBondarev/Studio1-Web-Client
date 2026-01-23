import axios from 'axios'
import {API_CONFIG} from '../../config.ts';

export interface ImageInfo {
  url: string
  supplierId: number
  fileName: string
}

export class ImageService {
  /**
   * Получить информацию об изображении по ID поставщика и имени файла
   * API возвращает JSON с URL изображения
   */
  async getImageInfo(supplierId: number, fileName: string): Promise<ImageInfo> {
    const response = await axios.get<ImageInfo>(
      `${API_CONFIG.baseURL}/api/Images/${supplierId}/${fileName}`,
      {
        timeout: 10000, // 10 секунд
      }
    )
    return response.data
  }

  /**
   * Получить прямой URL для запроса информации об изображении
   */
  getImageInfoUrl(supplierId: number, fileName: string): string {
    return `${API_CONFIG.baseURL}/api/Images/${supplierId}/${fileName}`
  }
}

export const imageService = new ImageService()

