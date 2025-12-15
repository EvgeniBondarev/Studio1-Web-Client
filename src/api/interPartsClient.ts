import type {ImageRequestItem, ImageResponseItem} from './clientTypes.ts';

const INTERPARTS_BASE_URL = 'https://api.interparts.ru'

export const interpartsFetch = async <T>(
    path: string,
    options?: RequestInit,
): Promise<T> => {
    const response = await fetch(`${INTERPARTS_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options?.body && { 'Content-Type': 'application/json' }),
            ...(options?.headers ?? {}),
        }
    })

    if (!response.ok) {
        throw new Error(`Interparts API error: ${response.status}`)
    }

    return response.json() as Promise<T>
}

export const fetchImagesByBrandArticle = (
    items: ImageRequestItem[],
): Promise<ImageResponseItem[]> => {
    return interpartsFetch<ImageResponseItem[]>('/s3/multifinderbrands', {
        method: 'POST',
        body: JSON.stringify(items),
    })

}
