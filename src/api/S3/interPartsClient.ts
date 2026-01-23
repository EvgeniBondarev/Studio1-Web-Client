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

export const fetchImageUrlByProducerId = (
    params: ImageRequestItem
): Promise<ImageResponseItem> => {

    const queryParams = new URLSearchParams({
        code: params.code,
        producer_id: params.producerId
    });

    const path = `/s3/image-url-by-producer-id?${queryParams.toString()}`;

    return interpartsFetch<ImageResponseItem>(path, {
        method: 'GET',
    });
}
